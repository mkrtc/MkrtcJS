# Быстрые ссылки
- [Быстрые ссылки](#быстрые-ссылки)
- [Философия](#философия)
- [Установка](#установка)
- [Подключение](#подключение)
- [Примеры](#примеры)
  - [Клиентские декораторы](#клиентские-декораторы)
    - [@Service()](#service)
    - [@State()](#state)
    - [@UseState()](#usestate)
    - [@Watch()](#watch)
    - [@UseEffect()](#useeffect)
    - [@Timer()](#timer)
    - [@OnPathChange()](#onpathchange)
    - [@UseNavigator()](#usenavigator)
  - [Общие декораторы](#общие-декораторы)
    - [@Injectable()](#injectable)
    - [@Inject()](#inject)
    - [@Repository()](#repository)
    - [@Entity()](#entity)
    - [@OnInit()](#oninit)
    - [@Catch()](#catch)
- [Типы](#типы)
    - [ServiceOptions](#serviceoptions)
    - [StateOptions](#stateoptions)
    - [StateTimerOptions](#statetimeroptions)
    - [ITimer](#itimer)
    - [TimerOptions](#timeroptions)
    - [Updater](#updater)
    - [AfterUpdater](#afterupdater)
    - [CatchHandle](#catchhandle)
    - [CatchOptions](#catchoptions)

# Философия

**MkrtcJS** - это фреймворк над фреймворком **[nextjs.](https://nextjs.org)** Проект вдохновлен такими фреймворками как **[nestjs](https://nestjs.com)** и **[angularjs](https://angularjs.org)** и так же как они использует декларативный подход в своей основе, только без излишеств.

**MkrtcJS** - предлагает использовать пяти ступенчатый архитектурный подход. Где:
* Нулевой уровень - это **Singleton** классы. *Пример: (HttpClient, CacheService, и пр.)*. На нулевом уровне обычно находятся все классы и сервисы из которых потом можно будет собрать репозитории. Классы на нулевом уровне помечаются декоратором **[@Injectable()](#injectable)** 

* Первый уровень - это репозитории для общения с API. Все репозитории помечаются декоратором @Repository().Репозитории могут внедрять в себя классы нулевого уровня с помощью декоратора @Inject().

* Второй уровень - это сущности описывающие конкретные сущности. *Пример: (UserEntity, ProductEntity, и пр.).* Все сущности помечаются декоратором **[@Entity()](#Entity())**. Все сущности так же как и репозитории могут внедрять в себя классы нулевого уровня а так же репозитории. 

* Третий уровень - это сервисы. Сервисы обычно создаются рядом с компонентом, и служат *"головой"* компонента. Сервисы отвечают за всю логику компонента, а так же управляют состоянием с помощью декораторов **@State()** и **@UseState**. Сервисы внутри себя могут внедрять как классы первого уровня так и репозитории.

* Четвёртый уровень - это компоненты. В next-dec компоненты максимально тупые(*в хорошем смысле*) и не реализуют никакую логику. Любой компонент использует в себя hook **useService(Service)** для получения стейта с так же сервис для обработки клиентских событий(*клик, ввод и пр.*)

# Установка
```bash
npm i @mkrtcjs/core
```

# Подключение
Чтобы обеспечить максимальную совместимость с серверными декораторами, советуем сразу из `middleware.ts` вернуть `bootstrap`. Это даст возможность на стороне сервера использовать `@Req()` декоратор. 
```ts
// middleware.ts
import { bootstrap } from "@mkrtcjs/core";
import { NextRequest } from "next/server";


export async function middleware(req: NextRequest){
    return await bootstrap(req);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```
---
Чтобы обеспечить связь между серверной и клиентской частью приложения, оберните все что внутри `<body></body>` компонентом `<MkrtcRootProvider />`.
```tsx
// layout.tsx
import { MkrtcRootProvider } from "@mkrtcjs/core";

export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <body>
        <MkrtcRootProvider>
            {children}
        </MkrtcRootProvider>
      </body>
    </html>
  );
}
```

# Примеры

## Клиентские декораторы

### @Service()
**@Service** - это декоратор класса, который создаёт из обычного класса сервис.

*Использование:*
```ts
import { Service } from "@mkrtcjs/core/client";

@Service(options)
export class MyService {}
```

Аргументы:
- `options?:` **[ServiceOptions](#serviceoptions)**

Декоратор **[@Service()](#service)** позволяет объявить/обновить состояние, следить за изменениями состоянии а так же внедрять репозитории и классы нулевого уровня.

*Пример:*
```tsx
// ./services/my.service.ts
import { Service, State, UseStateFactory } from "@mkrtcjs/core/client"
import { OnInit, Inject } from "@mkrtcjs/core";
import { UserRepository } from "@Repositories";

export interface MyServiceState{
    user: UserEntity | null;
    loading: boolean;
}

const UseMyServiceState = UseStateFactory.create<MyService, MyServiceState>();

@Service()
export class MyService implements MyServiceState{
    @State<UserEntity | null>(null)
    public user: UserEntity | null;

    @State<boolean>(false)
    public loading: boolean;

    @Inject(UserRepository)
    private userRepo!: UserRepository;

    @OnInit()
    private _onInit(){
        this.getUser();
    }

    @UseMyServiceState.return("user")
    @UseMyServiceState.autoToggle("loading")
    private getUser(){
        return this.userRepo.init();
    }
}
```
*Использование в компоненте:*
```tsx
// ./my.component.tsx
"use client"
import { useService } extends "@mkrtcjs/core/client";
import { MyService, MyServiceState } from "./services/my.service";

export const MyComponent = () => {
    const {service, user, loading} = useService<MyService, MyServiceState>(MyService, ["user", "loading"]);

    if(loading) return <div>...loading</div>;

    return (
        {user && <span>{user.username}</span>}
    )
}
```

> ***ВАЖНО***: Обязательно импортируйте `useService` из `@mkrtcjs/core/client`. Не передавайте в `useService` конструктор класса не обернутый в декоратор **[@Service()](#service)**
---

### @State()
**@State()** - уведомляет сервис о том, что необходимо подписаться на обновления свойства и вызвать ре-рендер компонента, при его изменении.

*использование:*
```ts
import { State } from "@mkrtcjs/core/client";
```
```ts
@State(initialValue, options)
public user: UserEntity | null;
```

*Параметры:*
 1. `initialValue?: T` - значение по умолчанию. `default = null`
 2. `options?:` - **[StateOptions](#stateoptions)**

*Пример:*

```ts
import { Service, State } from "@mkrtcjs/core/client";

interface MyServiceState{
    loading: boolean;
}

@Service()
export class MyService implements MyServiceState{
    @State<boolean>(false)
    public loading: boolean;
}
```
### @UseState()
Декоратор **@UseState()** - позволяет гибко управлять состоянием. Вообще @UseState сам по себе не декоратор, а обычный объект, декоратором являются его методы, которых аж 7 штук.

И так по порядку, сначала создадим 3 свойство с состоянием

```ts
@State<UserEntity | null>(null)
public user: UserEntity | null;

@State<boolean>(false)
public loading: boolean;

@State<number>(0)
public counter: number;
```

И так как нам взаимодействовать с состоянием? 

Для начала создадим декоратор с помощью фабрики **[UseStateFactory](#UseStateFactory)**. Это позволит не каждый раз не передавать тип сервиса и стейта в @UseState.
```ts
import { UseStateFactory } from "@mkrtcjs/core/client";

const UseUserState = UseStateFactory.create<UserService, UserServiceState>();
```
Отличие **UseUserState** от обычного **UseState** в том, что первый уже типизирован под наш сервис.

И так теперь рассмотрим какие методы нам дает **[@UseState()](#usestate)** и как с их помощь менять состояние.
1. `@UseService.return(key)` - как уже понятно из названия, кладёт в стейт `key` возвращаемое значение метода.

    *Пример:*
   ```ts
    @UseState.return("user")
    public initUser(){
        return this.userRepo.init();
    }
   ```
   *Параметры:*
   - key - Название ключа куда нужно положить значение
2. `@UseState.before(key, updater)` - Меняет состояния до вызова метода.
   
   *Пример:*
   ```ts
    @UseState.before("loading", () => true)
    public initUser(){
        return this.userRepo.init();
    }
   ```
   *Параметры:*
    - `key: string` - Название ключа куда нужно положить значение
    - `updater:` [Updater](#updater) - callback который должен возвращать новое значение
4. `@UseState.after(key, afterUpdater)` - Меняет состояния после вызова метода.
   
   *Пример:*
   ```ts
    @UseState.after("loading", () => false)
    @UseState.after("user", (current, returnValue) => returnValue)
    public initUser(){
        return this.userRepo.init();
    }
   ```
   *Параметры:*
    - `key: string` - Название ключа куда нужно положить значение
    - `updater:` [AfterUpdater](#afterupdater) - callback который должен возвращать новое значение
5. Методы `@UseState.increment(key)` и `@UseState.decrement(key)` -название уже говорит само за себя: increment увеличивает значение ключа на 1, decrement наоборот уменьшает на 1. 
     > ВАЖНО! Для того чтобы методы работали, обязательно значение состояния должен быть **Числом**, иначе выкинет ошибку

    *Пример:*
    ```ts
    // +1
    @UseState.increment("count")
    public addNumber(){}
    // -1
    @UseState.decrement("count")
    public subtractNumber(){}
    ```
    *Параметры:*
    - `key: string` - Ключ свойства
6. Методы `@UseState.toggle(key)` и `@UseState.autoToggle(key)` - переключатель boolean значений. Отличие их в том, что `.toggle()` просто переключает 1 раз, а autoToggle - до вызова устанавливает значение свойства на `true` а после `false`, удобно для всяких loader-ов.
    
    *Пример:*
    ```ts
    @State(false)
    public modalOpen: boolean;

    @State(false)
    public loading: boolean;
    
    @UseState.toggle("modalOpen") // modalOpen = true
    @UseState.autoToggle("loading") // loading = before true after false
    public getUser(id: number){
        return this.userRepo.findOnr(id);
    }
    ```
    *Параметры:*
    - `key: string` - Ключ свойства
7. Метод `@UseState.patch(key)` - принимает в аргументы название свойства, и возвращает все методы которые есть у обычного @UseState кроме `.patch` с тем отличием, что остальным методам больше не нужно указать `key`.
    
    *Пример:*
    ```ts
    @UseState.patch("user").return()
    public initUser(){
        return this.userRepo.init();
    }
    ```
    *Параметры:*
    - `key: string` - Ключ свойства
  
*Пример:*
```ts
@UseUserState.increment("counter") // При каждом вызове, counter += 1
@UseUserState.autoToggle("loading") // до вызова true, после - false
@UseUserState.return("user") // кладем то что вернётся метод, в "user"
public async getUser(id: number){
    return await this.userRepo.findOne(id);
}

@UseUserState.patch("counter").increment()

// что тут произошло? Мы с помощью дженерика указываем тип аргументов, в виде массив. В аргументы callback функции к нам падают Текущее значение, экземпляр текущего класса(сервиса) И аргументы с дженерик типом в виде массива
@UseUserState.before<[number, string]>("loading", (currentValue, instance, [arg1, arg2]) => true)
@UseUserState.after("loading", () => false)
// Тут вторым дженериком мы указываем тип возвращаемого значения, который после к нам попадет вторым аргументом в updater
@UseUserState.after<[number, string], UserEntity>("user", (cur, rv) => rv)
public testBeforeAfter(arg1: number, arg2: string): UserEntity {
    // code
}
```

### @Watch()
**@Watch()** - это декоратор, который вызывает метод, при изменении конкретного стейта.

*использование:*
```ts
import { Watch } from "@mkrtcjs/core/client";
@Watch(key)
private watch(key, next, prev){}
```

*Аргументы:*
- `key: string | string[] | "*"` - название стейтов за которыми нужно следить. Если `key = "*"` то будет следить за всеми свойствами.

*Аргументы в методе:*
- `key: string` - Ключ стейта на котором произошло изменение.
- `next: T` - новое значение стейта
- `prev?: T` - старое значение стейта

> ***ВАЖНО:*** @Watch() будет вызвать метод всегда, даже если в стейт положили одно и то же значение.

> ***ЗАМЕТКА:*** Старайтесь максимально избегать использования `@Watch("*")`. Это может повлиять на производительность, особенно если стейтов много.

### @UseEffect()
**@UseEffect** работает идентично [@Watch()](#watch) с тем отличием, что @UseEffect будет вызвать метод, только если новое значение стейта отличается от старого.

### @Timer()
Декоратор **@Timer()** как уже понятно из название создает таймер. 

*Использование:*
```ts
import { Timer } from "@mkrtcjs/core/client";

@Timer(key, options)
public method(){}
```

- `key: string;` - Название стейта
- `options:` **[TimerOptions](#timeroptions)** - Настройки таймера 

> Перед использованием @Timer() обязательно обявите стейт со значением `isTimer: true`

*Пример:*
```ts
import { State, Timer } from "@mkrtcjs/core/client";
import type { ITimer } from "@mkrtcjs/core/types";

@State<ITimer | null>(null, {isTimer: true})
public timer: ITimer;

@Timer("timer", {ms: 5000, tickRate: 1000})
public sendSmsCode(timer: Timer, ...args){}
```

> **ВАЖНО!!!** Не важно какое вы укажите значение по умолчанию для стейта, при использовании **`@Timer`** стейт будет переопределен на **[ITimer](#itimer)**

### @OnPathChange()
Декоратор **@OnPathChange** - Вызывает метод каждый раз когда utl путь меняется. Метод всегда принимает 1 параметр - `pathname`;

*Использование:*
```ts
import { OnPathChange } from "@mkrtcjs/core/client";

@OnPathChange()
private _onPathChange(pathname: string){}
```

### @UseNavigator()
Декоратор **@UseNavigator()** дает возможность использовать в аргументах метода слежующие декораторы:
- `@Router()` - Значение из netxjs/useRouter();
- `@Pathname()` - Значение из nextjs/usePathname();

*Использование:*
```ts
import { UseNavigator, Router, Pathname } from "@mkrtcjs/core/client";

@UseRouter()
public method(@Router() router: AppRouterInstance, @Pathname() pathname: string){}
```

> **ВАЖНО:** Декоратор `@UseNavigator()` не будет вызвать метод при каждом изменении url пути. Учите это при разработке.


## Общие декораторы
### @Injectable()

Декоратор **@Injectable()** внутри себя создаёт экземпляр класса и дальше передаётся через декоратор **[@Inject()](#inject)**

Ограничения:
 1. Класс обернутый декоратором **@Injectable()** в конструктор может принимать только другие классы обернутые декоратором **@Injectable()** 
Советы: 
 1. Оберните декоратором **Injectable()** только классы нулевого и первого уровня, а так же все остальные классы, которые могут быть **Single tone**.
 
*Использование:*
```ts
// ./http-client.ts
import { Injectable } from "@mkrtcjs/core";

@Injectable()
export class HttpClient{
  // you code
}
```

### @Inject()

Декоратор **@Inject()** - внедряет класс, в свойство класса. В параметры принимает конструктор класса который хочет внедрить. 

> ВАЖНО: Конструктор класса который необходимо внедрить, обязательно должен быть обернутым декоратором **[@Injectable()](#injectable)**, иначе внедрение не произойдёт.

*Использование:*
```ts
// ./user.repository.ts
import { Repository, Injectable, Inject } from "@mkrtcjs/core";
import { HttpClient } from "@/shared";
import { UserEntity, IUserEntity } from "@/entities";

@Repository()
@Injectable()
export class UserRepository{
   @Inject(HttpClient)
   private readonly httpClient: HttpClient;

   public async findAll(): Promise<UserEntity[]>{
     const users = await this.httpClient.get<IUserEntity>("/user");
     return users.map(user => new UserEntity(user));
   }
}
```

### @Repository()

Декоратор **@Repository()** - говорит классу о том, что он может в себя внедрять все классы помеченные декоратором [@Injectable()](#injectable). Пример [здесь](#inject). Может использоваться в связке с декоратором [@Injectable()](#injectable).

### @Entity()

Декоратор **@Entity()** - говорит классу о том, что он может в себя внедрять все классы помеченные декоратором [@Injectable()](#injectable). Не может использоваться в связке с декоратором [@Injectable()](#injectable).

*Пример:*
```ts
// ./user.entity.ts
import { Entity, Inject } from "@mkrtcjs/core";
import type { IUserEntity } from "./user.interface.ts";
import { UserRepository } from "@/repositories"

@Entity()
export class UserEntity implements IUserEntity{
    public readonly id: number;
    public name: string;
    // ...

    @Inject(UserRepository)
    private readonly userRepository: UserRepository;

    constructor(user: IUserEntity){
        Object.assign(this, user);
    }

    public async save(): Promise<UserEntity>{
       return await this.userRepository.update(this.id, this);
    }
}
```
### @OnInit()
Декоратор **@OnInit()** вызывает метод при инициализации сервиса. 

*Пример:*
```ts
import { OnInit } from "@mkrtcjs/core";

@OnInit()
private async _onInit(){
    await this.getUsers();
}
```
Теперь при первом использовании **[useService()](#useservice)** будет вызван _onInit() метод.

> **ЗАМЕТКА!!!** Название метода может быть любым.

> **ЗАМЕТКА!!!** Рекомендуем сделать метод приватным.

> **ВАЖНО!!!** Метод вызовется только при инициализации сервиса. Т.е. если вы в родительском классе внедрили сервис с помощью хука **[[#useService()]]**, а дальше в дочернем компонент тоже пытаетесь внедрить сервис, то инициализация не произойдёт, поскольку сервис уже инициализирован в родительском компоненте, а вы в дочернем компоненте вы его получите из DI контейнера.

### @Catch()
Декоратор **@Catch()** автоматом оборачивает метод в try/catch.

*Использование:*
```ts
import { Catch } from "@mkrtcjs/core";

@Catch<Instance, args[], Error>(handler: CatchHandle<Instance, args[], Error>, options?: CatchOptions)
public method(){
    if(1 !== 2) throw new Error();
}
```

- `handler:` **[CatchHandle](#catchhandle)** - callback функция, которая отработает в случае ошибки.
- `options?:` **[CatchOptions](#catchoptions)** - Настройки

# Типы

### ServiceOptions
```ts
interface ServiceOptions {
    isGlobal?: boolean;
}
```
- `isGlobal?: boolean` - Будет ли сервис глобальный или нет. Глобальный сервис не удаляется при демонтировании родительского компонента, либо при отсутствии владельцев. Свойство можно переопределить в [useService()](#useservice)

### StateOptions
```ts
interface StateOptions{
    isTimer?: boolean;
    timerOptions?: StateTimerOptions
}
```
- `isTimer?: boolean` - если `true`, то [[Примеры#Клиентские декораторы#@State()|@State()]] будет иметь тип [[#ITimer]].
- `timerOptions?:` **[StateTimerOptions](#StateTimerOptions)** - Настройки таймера. Будет работать только если `isTimer = true`.

### StateTimerOptions 
```ts
interface StateTimerOptions{
    delay?: number;
}
```
- `delay: number` - через сколько миллисекунд запустить таймер.
  
### ITimer
```ts
interface ITimer {
    completed: boolean;
    left: number;
    ms: number;
}
```
- `ms: number` - Насколько миллисекунд был запущен таймер.
- `left: number` - Сколько миллисекунд осталось до завершения таймера.
- `completed: boolean` - Запрещён ли отчёт таймера.
  
### TimerOptions
```ts
interface TimerOptions {
    tickRate: number;
    ms: number;
    onTick?: (timer: ITimer) => void;
}
```
- `tickRate: number;` - Раз в сколько `ms` вызвать ре-рендер компонента.
- `ms: number;` - Насколько `ms` запустить таймер
- `onTick?: (timer: ITimer) => void;` - callback который будет вызван каждый `tickRate`.
### Updater
```ts
type Updater<S, C, A> = (current: S, args: A, instance: C) => S;
```
- `current: T` - Текущее значение состояния.
- `args: A[]` - Аргументы метода.
- `instance: C` - Экземпляр текущего сервиса.

### AfterUpdater
```ts
type AfterUpdater<S, R, C, A> = (current: S, returnValue: R, args: A, instance: C) => S;
```
- `current: T` - Текущее значение состояния.
- `returnValue` - Возвращаемое значение метода.
- `args: A[]` - Аргументы метода.
- `instance: C` - Экземпляр текущего сервиса.

### CatchHandle
```ts
interface CatchHandle<I, A, E extends Error> {
    instance: I;
    args: A;
    exp: E;
}
```
- `instance: I;` - экземпляр класса где используется декоратор
- `args: A[];` - аргументы метода
- `Error: E;` - тип ошибки который может выкинуть метод

### CatchOptions
```ts
interface CatchOptions {
    rethrow?: boolean;
    useReturn?: boolean;
}
```
- `useReturn: boolean;` - если `true`, то метод вернет callback при ошибке
- `reThrow: boolean;` - если `true`, то выкинет ошибку наружу
---