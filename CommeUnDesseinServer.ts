import { CommeUnDessein } from "./tipibot-controller-gui/ts/Plugins/CommeUnDesseinStatic"
import fs from 'fs';

const commeUnDesseinSettingsPath = './comme-un-dessein.json'

export class CommeUnDesseinServer extends CommeUnDessein {

	constructor(testMode=false) {
		super()
		
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

	saveSettings(key: string, value: any) {
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