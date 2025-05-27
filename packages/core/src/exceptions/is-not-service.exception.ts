

export class IsNotServiceException extends Error{

    constructor(name: string){
        const message = `"${name}" is not a service.\nusage:\n@Service()\nexport MyService{...}`;
        super(message);
    }
}