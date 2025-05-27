

export class StateNotFoundException extends Error{

    constructor(name: string, key: string){
        const message = `State ${key} not found in service ${name}.\nPlease check your state property.\nCorrect usage:\n\n@State<number>(0)\npublic state: number;`;
        super(message);
    }
}