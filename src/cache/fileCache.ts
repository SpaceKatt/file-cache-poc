import { Cache } from '../interfaces';

export class FileCache implements Cache {
    private name: string;

    constructor(name: string) {
        this.name = name;
    }

    get(key: string) {
        throw new Error('Method not implemented.');
    }

    set(key: string, data: any): void {
        throw new Error('Method not implemented.');
    }
}
