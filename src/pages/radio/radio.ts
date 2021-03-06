import { Component, Inject } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { Media, MediaObject } from '@ionic-native/media';
import { RestangularModule, Restangular } from 'ngx-restangular';
import { Observable } from 'rxjs/Observable';
import { TimerObservable } from "rxjs/observable/TimerObservable";
import { RadioPlaylist } from '../shared/radioPlaylist';
import { Radiolinks } from '../shared/radiolinks';
import { BackgroundMode } from '@ionic-native/background-mode';
import { FavoriteProvider } from '../../pages/shared/monitoringStorage';
//import { ScreenOrientation } from '@ionic-native/screen-orientation';

@IonicPage({})
@Component({
  selector: 'page-radio',
  templateUrl: 'radio.html'
})

export class RadioPage {
  radio: MediaObject;
  isStreaming: boolean = false;
  radioplaylist: RadioPlaylist;
  radiolinks: Radiolinks;
  private alive: boolean;
  private interval: number;
  errMess: string;
  jsonStorageKey: string = 'appJsonList';
  testRadioOpen = false;

  constructor(
    private media: Media,  
    public backgroundMode : BackgroundMode,
    public platform: Platform,
    public restangular: Restangular, 
    public favoriteProvider: FavoriteProvider,
    public alertCtrl: AlertController,
    //private screenOrientation: ScreenOrientation
  ) {
    //this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    this.alive = true;
    this.interval = 5000;
  }

  ngOnInit() {
    this.prepareAudioFile().then((data) => {
      this.radiolinks = data.radioresources;
      //set radio frequency
      this.doRadioFreq(this.radiolinks);

      TimerObservable.create(0, this.interval)
        .takeWhile(() => this.alive)
        .subscribe(() => {
          this.prepareRadioDetail().subscribe((data) => {
            //first insertion radioplaylist is null, subsequent change only update when current title changes
            console.log("radio items detail: ");
            console.log(data);
            if(this.radioplaylist == null){
              this.radioplaylist = data.radioplaylist;
            }else if(this.radioplaylist != null && this.radioplaylist.current.title != data.radioplaylist.current.title){
              this.radioplaylist = data.radioplaylist;
            }
          }, errmess => {this.radioplaylist = null; this.errMess = <any>errmess});
        });
    })
  }

  doRadioFreq(radiolinks) {
    const alert = this.alertCtrl.create({enableBackdropDismiss: false});
    alert.setTitle('Please select a radio frequency: ');
    alert.addInput({
      type: 'radio',
      label: 'Low Bit-rate (48kpbs)',
      value: this.radiolinks.radiolink_48KBPS,
      checked: true
    });

    alert.addInput({
      type: 'radio',
      label: 'Medium Bit-rate (56kpbs)',
      value: this.radiolinks.radiolink
    });

    alert.addInput({
      type: 'radio',
      label: 'High Bit-rate (128kpbs)',
      value: this.radiolinks.radiolink_128KBPS
    });

    alert.addButton({
      text: 'Ok',
      handler: (data: any) => {
        console.log('Radio link chosen:', data);
        this.testRadioOpen = false;
        this.platform.ready().then(() => {
          this.radio = this.media.create(data);
        });
      }
    });

    alert.present();
  }



  ngOnDestroy(){
    //console.log("destroy");
    this.alive = false; // switches your TimerObservable off
  }

  ionViewWillLeave(){
    this.disableBackgroundMode();
    this.radio.stop();
    this.radio.release();
  }

  prepareAudioFile(): any {
    return this.favoriteProvider.getAllFavoriteItems(this.jsonStorageKey);
  }

  prepareRadioDetail(): Observable<any> {
    //console.log("start");
    return this.restangular.one('db2').get();
  }

  playRadio() {
    this.enableBackgroundMode();
    this.backgroundMode.on("activate").subscribe(()=>{
      console.log("radio activated.............");
      this.radio.play();
      this.isStreaming = true;
    });  
    this.radio.play();
    this.isStreaming = true;
  }

  pauseRadio() {
    this.disableBackgroundMode();
    this.radio.pause();
    this.isStreaming = false;
  }

  private enableBackgroundMode(): void {
    if(!this.backgroundMode.isEnabled()) {
      console.log("enable background.....");
      this.backgroundMode.enable();
    }
  }

  private disableBackgroundMode(): void {
      if(this.backgroundMode.isEnabled()) {
        console.log("disable background.....");
        this.backgroundMode.disable();
      }
  }
}
