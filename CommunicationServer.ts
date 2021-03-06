import { Communication } from "./tipibot-controller-gui/ts/Communication/CommunicationStatic"
const events = require('events');

export class CommunicationServer extends Communication {

    static emitter = new events.EventEmitter()
	static communication: CommunicationServer;
    onControllerMessage: (type: string, data:any)=>void
	sendToClient: (message: string, data:any)=>void

    constructor(onControllerMessage: (message: string, data:any)=>void, sendToClient: (message: string, data:any)=>void) {
        super()
        this.onControllerMessage = onControllerMessage
		this.sendToClient = sendToClient
		CommunicationServer.communication = this
    }
	
	connectToSerial() {
		CommunicationServer.emitter.on('message',  (event:any)=> this.onMessage(event))
		// CommunicationServer.emitter.on('open',  (event:any)=> this.onWebSocketOpen(event))
		// CommunicationServer.emitter.on('close',  (event:any)=> this.onWebSocketClose(event))
		// CommunicationServer.emitter.on('error',  (event:any)=> this.onWebSocketError(event))
	}

	send(type: string, data: any = null) {
        this.onControllerMessage(type, data)
	}

}
