import React, {Component} from 'react';

import AppsIcon from '@material-ui/icons/Apps';

import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import SettingsIcon from '@material-ui/icons/Settings';
import InstallDialog from './install/InstallDialog';

import BumblebeeClient from './bumblebee-client/BumblebeeClient';
import ConsoleOutput from './console/ConsoleOutput';
import _console from './console/console';

import DeepSpeechInstalled from './apps/DeepSpeechInstalled';


import Main from './Main';

const ipcRenderer = window.ipcRenderer;

const inputModePlaceholders = {
	stt: "speech to text",
	tts: "text to speech",
	hot: "hotword commands"
};

class App extends Component {
	constructor(props) {
		super(props);
		
		
		this.state = {
			connected: false,
			recording: false,
			muted: false,
			// microphoneColor: '#eee',
			soundPlaying: false,
			soundTheme: 'startrek1',
			hotword: 'ANY',
			microphoneVolume: 1,
			sayVolume: 1,
			recognitionOutput: [],
			logo: null,
			controlsVisible: false,
			useSystemMic: true,
			showInstallDialog: false,
			inputMode: 'stt',
			config: {},
			appDisplay: {},
			sayPlaying: false,
			
			activeAssistant: null,
			activeAssistantApp: null
		};
		
		this.console = _console.bind(this);
		
		this.speechOscilloscopeRef = React.createRef();
		this.sayOscilloscopeRef = React.createRef();
		this.vadStatusRef = React.createRef();
		this.contentRef = React.createRef();
		this.consoleInputRef = React.createRef();
		this.contentPanelRef = React.createRef();
		
		this.logosPath = "images/logos/";

		this.images = {
			bumblebee: {
				default: this.logosPath + '/logo-autobots.png',
				hotword: this.logosPath + '/logo-autobots-hotword.png',
				speaking: this.logosPath + '/logo-autobots-speaking.png',
			}
			// mainMenu: this.logosPath + '/logo-decepticons.png',
		};
		
		this.logos = {
			// mainMenu: this.logosPath + '/logo-decepticons.png',
			default: this.logosPath + '/logo-autobots.png',
			hotword: this.logosPath + '/logo-autobots-hotword.png',
			speaking: this.logosPath + '/logo-autobots-speaking.png',
		};
		
		this.colors = {
			micAssistantMainColor: '#d6bc22',
			micAssistantAppColor: '#fff',
			micMainMenuColor: '#777',
			ttsColor: '#7c9fff' //'#57f'
		}
		
		// this.state.logo = this.logos.mainMenu;
		
		window.app = this;
	}
	
	// displayApp(hotword, appName, logo) {
	// 	debugger;
	// 	this.setState({
	// 		appDisplay: {
	// 			hotword,
	// 			appName,
	// 			logo
	// 		}
	// 	});
	// }
	
	setMicrophoneColor(color) {
		this.setState({microphoneColor: color});
		if (this.bumblebee.analyser) {
			this.bumblebee.analyser.setLineColor(color);
		}
		else {
			debugger;
		}
	}
	
	updateBanner() {
		
		if (this.state.activeAssistant) {
			const isMain = this.state.activeAssistantApp==='main'
			let logo;
			
			if (this.state.sayPlaying) {
				logo = this.logos.speaking
			}
			else {
				logo = isMain? this.logos.hotword : this.logos.default
			}
			
			this.setState({
				logo
			});
			
			this.setMicrophoneColor(isMain? this.colors.micAssistantMainColor : this.colors.micAssistantAppColor);
		}
		else {
			this.setState({
				logo: null //this.logos.mainMenu
			});
			this.setMicrophoneColor(this.colors.micMainMenuColor);
		}
	}
	
	async main() {
		setTimeout(function() {
			// debugger;
			ipcRenderer.send('bumblebee-start-server', 'bumblebee', 'help');
		},100);
		
		// this.bumblebee.console('main()');
		//
		// try {
		// 	await Main(this.bumblebee);
		// }
		// catch(e) {
		// 	this.addSpeechOutput({
		// 		text: e.toString()
		// 	});
		// 	debugger;
		// 	await this.bumblebee.say('the main application encountered an error');
		// }
		//
		// await this.bumblebee.say('restarting main');
		//
		// return this.main();
	}
	
	resize() {
		let contentPanelRef = this.contentPanelRef.current;
		if (contentPanelRef) {
			let h = (window.innerHeight - 151);
			contentPanelRef.style.height = h + 'px';
		}
	}
	
	componentDidMount() {
		window.addEventListener('resize', e => this.resize());
		this.resize();
		
		ipcRenderer.on('electron-ready', (event, config) => {
			this.setElectronConfig(config);
			
			this.bumblebee = new BumblebeeClient(this);
			
			if (this.state.config.deepspeechInstalled) {
				this.bumblebee.startRecording();
				// this.launch('MainMenu');
				this.main();
				// this.bumblebee.simulateSTT('main menu');
			}
			else {
					debugger;
				// this.bumblebee.say('Welcome to Bumblebee')
				// .then(() => {
				// 	return this.bumblebee.say('It looks like you don\'t have DeepSpeech installed');
				// })
				// .then(() => {
				// 	return this.bumblebee.say('Let\'s install it now');
				// })
				// .then(() => {
				// 	this.showInstall(true);
				// });
					this.showInstall(true);
				
				
				// return;
				// this.bumblebee.launch('DeepSpeechInstall');
			}
			console.log('electron ready');
		});
		
		console.log('send client-ready');
		ipcRenderer.send('client-ready');
	}
	
	setElectronConfig(config) {
		this.setState({
			connected: true,
			config
		});
	}
	
	updateConfig() {
		let config = ipcRenderer.sendSync('get-bumblebee-config');
		this.setElectronConfig(config);
	}
	
	deepspeechInstalled() {
		this.setState({
			showInstallDialog: false,
		});
		this.updateConfig();
		// this.startIntro();
		debugger;
		
		let r = DeepSpeechInstalled(this.bumblebee);
		this.main();
	}
	
	startIntro() {
		// customize(this)
		// .then(r => {
		// 	debugger;
		// })
		// .catch(e => {
		// 	debugger;
		// });
	}
	
	showInstall(show) {
		this.setState({
			showInstallDialog: show
		});
	}
	
	render() {
		const sayClass = this.state.sayPlaying ? 'visible' : 'hidden';
		
		const Mic = this.state.recording ? MicIcon : MicOffIcon;
		
		let logoImage;
		if (this.state.logo) logoImage = (<img src={this.state.logo}/>);
		else logoImage = (<AppsIcon />);
		
		return (<div className="App">
			
			{this.state.showInstallDialog ? (<InstallDialog onInstalled={() => this.deepspeechInstalled()}
															onCancel={() => this.showInstall(false)}/>) : null}
			
			<div id="header">
				
				<div id="banner">
					<canvas id="vad-status" ref={this.vadStatusRef} width="10" height="9"/>
					
					<canvas id="speech-oscilloscope" className="oscilloscope" ref={this.speechOscilloscopeRef}/>
					<canvas id="say-oscilloscope" className={"oscilloscope " + sayClass} ref={this.sayOscilloscopeRef}/>
					
					<div id="logo" onClick={e => this.toggleControls()}>
						{/*<img src={"images/logos/" + this.state.logo + ".png"}/>*/}
						{logoImage}
					</div>
					
					<div id="mic-icon" className="banner-icon" onClick={e => this.bumblebee.toggleRecording()}>
						<Mic/>
						<div className="text">Mic {this.state.recording ? 'On' : 'Off'}</div>
					</div>
					
					<div id="settings-icon" className="banner-icon" onClick={e => this.showSettings()}>
						<SettingsIcon/>
						<div className="text">Settings</div>
					</div>
				</div>
			</div>
			
			{this.renderAppBar()}
			
			<div className="container">
				{this.renderContent()}
				{this.renderConsoleInput()}
			</div>
		</div>);
	}
	
	renderAppBar() {
		let name;
		let clss = '';
		
		if (this.state.activeAssistant) {
			if (this.state.activeAssistantApp) {
				if (this.state.activeAssistantApp === 'main') {
					name = this.state.activeAssistantName;
					clss = 'assistant-main';
				}
				else name = this.state.activeAssistantApp;
			}
			else name = '[none]';
		}
		else name = 'Main Menu';
		
		if (this.state.sayPlaying) {
			clss = 'tts';
		}
		
		return (<div id="app-bar" className={clss}>
			{name}
		</div>);
	}
	
	toggleControls() {
		// this.setState({
		// 	controlsVisible: !this.state.controlsVisible
		// });
	}
	
	renderContent() {
		return (<div className="content" ref={this.contentRef}>

			<div className="content-panel" ref={this.contentPanelRef}>
				{/*{this.renderControls()}*/}
				{this.renderRecognitionOutput()}
			</div>
		</div>);
	}
	
	renderConsoleInput() {
		
		return (<div id="console-input">
			
			<select onChange={e => this.changeInputMode(e.target.options[e.target.selectedIndex].value)}
					value={this.state.inputMode}>
				<option value="stt">STT</option>
				<option value="tts">TTS</option>
				<option value="hot">HOT</option>
			</select>
			
			<input type="text" ref={this.consoleInputRef} placeholder={inputModePlaceholders[this.state.inputMode]}
				   onKeyPress={this.keypressConsoleInput}/>
			
			<button onClick={e => this.executeConsoleInput()}>
				Execute
			</button>
			
			<button onClick={e => this.bumblebee.clearConsole()}>
				Clear
			</button>
		</div>);
	}
	
	// // todo; settings
	// renderControls() {
	// 	const controlsClass = this.state.controlsVisible ? 'block' : 'none';
	//
	// 	return (<div className={'controls ' + controlsClass}>
	//
	// 		Hotword: <select onChange={e => this.bumblebee.changeHotword(e.target.options[e.target.selectedIndex].value)}
	// 						 value={this.state.hotword}>
	// 		<option value="OFF">- OFF -</option>
	// 		<option value="bumblebee">bumblebee</option>
	// 		<option value="grasshopper">grasshopper</option>
	// 		<option value="hey_edison">hey_edison</option>
	// 		<option value="porcupine">porcupine</option>
	// 		<option value="terminator">terminator</option>
	// 		<option value="ANY">- ANY -</option>
	// 	</select>
	//
	// 		<br/><br/>
	//
	// 		<button disabled={!this.state.recording} onClick={e => this.toggleMute()}>
	// 			{this.state.muted ? 'Unmute' : 'Mute'}
	// 		</button>
	//
	//
	// 		<button onClick={e => {
	// 			ipcRenderer.send('dev-tools');
	// 		}}>
	// 			Dev Console
	// 		</button>
	//
	// 		<br/>
	//
	// 	</div>);
	// }
	
	changeInputMode(value) {
		this.setState({
			inputMode: value
		});
	}
	
	keypressConsoleInput = (e) => {
		if (e.key === 'Enter') {
			this.executeConsoleInput();
		}
	}
	
	setConsoleInputText(t) {
		this.consoleInputRef.current.value = t;
	}
	executeConsoleInput() {
		let text = this.consoleInputRef.current.value;
		if (this.state.inputMode === 'stt') {
			this.bumblebee.simulateSTT(text);
		}
		if (this.state.inputMode === 'tts') {
			this.bumblebee.simulateTTS(text);
		}
		if (this.state.inputMode === 'hot') {
			this.bumblebee.simulateHotword(text);
		}
	}
	
	showSettings() {
		// load Settings
	}
	
	addSpeechOutput(data) {
		const {recognitionOutput} = this.state;
		data.activeAsszistant = this.bumblebee.activeAssistant;
		data.activeAsszistantApp = this.bumblebee.activeAsszistantApp;
		recognitionOutput.push(data);
		// if (recognitionOutput.length > 100) recognitionOutput.length = 100;
		this.setState({recognitionOutput}, () => {
			// document.getElementByid('content-panel').scroll(0,100000000000000);
			this.contentPanelRef.current.scroll(0,100000000000000)
		});
	}
	renderRecognitionOutput() {
		return (<ConsoleOutput bumblebee={this.bumblebee} recognitionOutput={this.state.recognitionOutput}/>);
	}
}

export default App;
