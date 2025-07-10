import "reflect-metadata";
import { STATE_META_KEY } from "@/common/index.js";
import type { DecoratorMetadata, ITimer } from "@/types/index.js";
import { IState } from "../use-state/index.js";
import { IService } from "../service/index.js";

interface TimerOptions {
    tickRate: number;
    ms: number;
    onTick?: (timer: ITimer) => void;
}

let timerMap = new WeakMap<IService, Record<string, NodeJS.Timeout>>();

/**
 * Run timer
 * 
 * @example
 * // service
 * interface MyServiceState{
 *     timer: ITimer;
 * }
 * 
 * *@Service()
 * export class MyService extends AbstractService<MyServiceState> implements MyServiceState{
 *  *@State<ITimer | null>(null, {isTimer: true})
 *  public timer: ITimer;
 * 
 *  *@Timer("timer", {ms: 5000, tickRate: 1000})
 *  public runTimer(){
 *      // do something
 *  }
 * }
 * 
 * // component
 * import { MyService } from "./services/my-service.ts";
 * import { useService } from "@mkrtcjs/core";
 * 
 * export const MyComponent = () => {
 *  const {service, timer} = useService(MyService, ["timer"]);
 * 
 *  return (
 *      <div>
 *          <button onClick={() => service.runTimer()}>Run Timer</button>
 *          <span>{timer.left / 1000}</span>
 *      </div>
 *  )
 * }
 */
export const Timer = <T extends object>(key: keyof T, options: TimerOptions): MethodDecorator => (target, propertyKey, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    const states: DecoratorMetadata<IState>[] = Reflect.getMetadata(STATE_META_KEY, target);
    const state = states.find(s => s.key === String(key));

    if (!state || !state.value.options?.isTimer) throw new Error(`State ${String(key)} is not a timer`);


    descriptor.value = function (...args: any[]) {
        const self = this as IService;
        const { ms, tickRate } = options;

        const timers = timerMap.get(self) ?? {};
        if (timers[key as string]) {
            clearInterval(timers[key as string]);
        }

        let ticks = 0;

        self.__setState(key.toString(), {
            completed: false,
            left: ms,
            ms
        });

        const interval = setInterval(() => {
            ticks++;
            const left = Math.max(ms - ticks * tickRate, 0);
            
            self.__setState(key.toString(), {
                completed: left <= 0,
                left,
                ms
            });

            options.onTick?.(self.__state[key.toString()]);

            if (left <= 0) {
                clearInterval(interval);
                delete timers[key as string];
                method.apply(self, args);
            }

        }, tickRate);

        timers[key as string] = interval;
        timerMap.set(self, timers);

    }
}