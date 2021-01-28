import { EventEmitter } from 'events';
import * as fs from 'fs';

export function getSdk(_apiConfig: any) {
    return sdk;
}

const sdk = {
    auth: {
        whoami: async () => {
            return {
                id: '1111-1111-1111-1111',
                slug: 'worker-1111-1111-1111-1111',
            }
        },
    },
    card: {
        create: (_data: any) => {
            return {
                id: '1234-1234-1234-1234',
                slug: 'card-1234-1234-1234-1234'
            }
        },
        get: (_id: string) => {
            return {
                id: '1234-1234-1234-1234',
                slug: 'card-1234-1234-1234-1234'
            }
        },
        update: (_id: string, _type: string, _data: any) => {},
    },
    setAuthToken: async (_authToken: string) => {},
    stream: async (_schema: any) => {
        const interval = 5000;
        
        const task = JSON.parse(
            await fs.promises.readFile('./task.json', 'utf8')
        );
        
        const taskEmitter = new EventEmitter();
        setInterval(() => {
            taskEmitter.emit('update', task);
        }, interval)
        
        return taskEmitter; 
    },
}


