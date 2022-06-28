import { Communication } from "./tipibot-controller-gui/ts/Communication/CommunicationStatic"
const events = require('events');

export class CommunicationServer extends Communication {

    static emitter = new events.EventEmitter()
    onControllerMessage: (type: string, data:any)=>void

    constructor(onControllerMessage: (message: string, data:any)=>void) {
        super()
        this.onControllerMessage = onControllerMessage
    }

	onMessage(messageObject: any): void {
		super.onMessage(messageObject)
		let type = messageObject.type
		let data = messageObject.data
		if(type == 'comme-un-dessein') {
			// data.value

		}
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
