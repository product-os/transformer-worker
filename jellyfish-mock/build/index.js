"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = __importDefault(require("socket.io"));
const http = __importStar(require("http"));
const morgan_1 = __importDefault(require("morgan"));
const _ = __importStar(require("lodash"));
const body_parser_1 = __importDefault(require("body-parser"));
const task_1 = __importDefault(require("./fixtures/task"));
const actor_1 = __importDefault(require("./fixtures/actor"));
const app = express_1.default();
const server = http.createServer(app);
const port = 3000;
app.use(morgan_1.default('combined'));
app.use(body_parser_1.default.json());
app.get('/', (_req, res) => {
    res.send('Jellyfish stub');
});
app.get('/api/v2/config', (_request, response) => {
    return response.sendStatus(501);
});
app.get('/health', (_request, response) => {
    return response.sendStatus(501);
});
app.get('/status', (_request, response) => {
    return response.sendStatus(501);
});
app.get('/ping', (_request, response) => {
    return response.sendStatus(501);
});
app.get('/api/v2/registry', async (_request, response) => {
    return response.sendStatus(501);
});
app.get('/api/v2/oauth/:provider/:slug', (_request, response) => {
    return response.sendStatus(501);
});
app.post('/api/v2/oauth/:provider', (_request, response) => {
    return response.sendStatus(501);
});
app.get('/oauth/:provider', (_request, response) => {
    return response.sendStatus(501);
});
app.get('/api/v2/type/:type', async (_request, response) => {
    return response.sendStatus(501);
});
app.get('/api/v2/id/:id', async (request, response) => {
    const fixtures = [
        task_1.default,
        actor_1.default,
    ];
    const result = _.find(fixtures, { id: request.params.id });
    if (result) {
        return response.status(200).json(result);
    }
    return response.sendStatus(501);
});
app.get('/api/v2/slug/:slug', async (_request, response) => {
    return response.sendStatus(501);
});
app.all('/api/v2/hooks/:provider/:type*?', (_request, response) => {
    return response.sendStatus(501);
});
app.get('/api/v2/file/:cardId/:fileName', async (_request, response) => {
    return response.sendStatus(501);
});
app.post('/api/v2/action', async (request, response) => {
    console.log(request.body);
    const payload = request.body;
    if (payload.action === 'action-create-card@1.0.0') {
        if (payload.card === 'session@1.0.0') {
            console.log('returning session card stub');
            return response.status(200).json({
                error: false,
                data: {
                    id: 'c576c994-56be-4a9a-af43-67541ff37843',
                    slug: 'session-foo',
                    type: 'session@1.0.0',
                    version: '1.0.0'
                },
                timestamp: new Date().toISOString()
            });
        }
    }
    return response.sendStatus(501);
});
app.post('/api/v2/query', async (_request, response) => {
    return response.sendStatus(501);
});
app.post('/api/v2/view/:slug', (_request, response) => {
    return response.sendStatus(501);
});
app.get('/api/v2/whoami', async (_request, response) => {
    const slug = 'transformer-worker-88809ab';
    return response.status(200).json({
        error: false,
        data: {
            id: '1111-1111-1111-1111',
            slug
        }
    });
});
app.post('/api/v2/signup', async (_request, response) => {
    return response.sendStatus(501);
});
const socketServer = socket_io_1.default(server, {
    pingTimeout: 60000,
    transports: ['websocket', 'polling']
});
socketServer.on('connection', (socket) => {
    socket.setMaxListeners(50);
    socket.on('query', (payload) => {
        if (!payload.token) {
            return socket.emit({
                error: true,
                data: 'No session token'
            });
        }
        setTimeout(() => {
            socket.emit('update', {
                error: false,
                data: {
                    after: task_1.default,
                    type: 'update'
                }
            });
        }, 500);
        socket.emit('ready');
    });
});
server.listen(port, () => {
    console.log(`Jellyfish stub listening at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map