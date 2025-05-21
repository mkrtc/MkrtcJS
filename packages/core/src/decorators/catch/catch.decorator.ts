


interface CatchCbArgs<I, A, E extends Error> {
    instance: I;
    args: A;
    exp: E;
}

type ErrorHandle<I, A, E extends Error> = (instance: I, args: A, exp: E) => any;

interface CatchOptions {
    rethrow?: boolean;
    useReturn?: boolean;
}

const handle = <I, A, E extends Error>(handler: ErrorHandle<I, A, E>, instance: I, args: A, exp: E, options?: CatchOptions) => {
    const res = handler?.(instance, args, exp);
    if (options?.useReturn) return res;
    if (options?.rethrow) throw exp;
}

/**
 * @example
 * class MyClass{
 *  // type instance = MyClass
 *  // type args = [number, string]
 *  // type exp = Error
 * *@Catch<MyClass, [number, string], Error>({instance, args, exp}) => {...}) 
 *  public method(arg1: number, arg2: string){
 *   ...
 *   throw new Error('some error');
 *  }
 * }
 */
export const Catch = <I, A, E extends Error>(handler?: ErrorHandle<I, A, E>, options?: CatchOptions): MethodDecorator => (_, __, descriptor: PropertyDescriptor) => {
    const method = descriptor.value!;


    descriptor.value = function (...args: any[]) {
        try {
            const result = method.apply(this, args);

            if (result instanceof Promise) {
                return result.catch((exp: E) => {
                    if(handler) return handle(handler, this as I, args as A, exp, options)
                });
            }

            return result;
        } catch (exp) {
            if(handler) return handle(handler, this as I, args as A, exp as E, options)
        }
    }
}