import { CommeUnDessein, State } from "./tipibot-controller-gui/ts/Plugins/CommeUnDesseinStatic"
import fs from 'fs';
import qs from 'qs'
import { CommunicationServer } from "./CommunicationServer";
const axios = require('axios');

const commeUnDesseinSettingsPath = 'comme-un-dessein.json'

export class CommeUnDesseinServer extends CommeUnDessein {

	constructor(testMode=false) {
		super(testMode)
		this.loadSettings()
	}

	loadSettings() {
		try {
			const data = fs.readFileSync(commeUnDesseinSettingsPath, 'utf8');
			let commeUnDesseinSettings = JSON.parse(data);
			this.mode = commeUnDesseinSettings.mode
			this.origin = commeUnDesseinSettings.origin
			this.secret = commeUnDesseinSettings.secret
		} catch (err) {
			console.error(err);
		}
	}

	setState(state: State): void {
		super.setState(state)
		this.sendState()
	}

	sendState() {
		console.log('send comme-un-dessein-state: ', this.state)
		CommunicationServer.communication.sendToClient('comme-un-dessein-state', {state: this.state})
	}

	request(data: { method: string, url: string, data: any }, callback: (response:any)=> void, error: (response:any)=> void) {
		axios.post(data.url,  qs.stringify(data.data)).then((res)=>callback(res.data)).catch(error)
	}

	saveSettings(key: string, value: any) {
		super.saveSettings(key, value)
		if(['mode', 'origin', 'secret'].indexOf(key)<0){
			console.log('Error: key ', key, 'is not "mode", "origin" or "secret".')
			return
		}
		this[key] = value

		try {
			fs.writeFileSync(commeUnDesseinSettingsPath, JSON.stringify({ mode: this.mode, origin: this.origin, secret: this.secret}));
		} catch (err) {
			console.error(err);
		}
	}
}