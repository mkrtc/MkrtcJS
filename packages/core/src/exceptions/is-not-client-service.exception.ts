

export class IsNotClientServiceException extends Error{

    constructor(name: string){
        const message = `"${name}" is not a client service.\nusage:\n@Service({server: false})\nexport MyService{...}`;
        super(message);
    }
}