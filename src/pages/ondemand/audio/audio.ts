import { Component } from '@angular/core';
import { Platform, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Media, MediaObject } from '@ionic-native/media';
import { File } from '@ionic-native/file';
import { FavoriteProvider } from '../../shared/monitoringStorage';
import { HTTP } from '@ionic-native/http';
import { Radiolinks } from '../../shared/radiolinks';
import { Observable } from 'rxjs/Observable';
import { Restangular } from 'ngx-restangular';
/**
 * Generated class for the AudioPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-audio',
  templateUrl: 'audio.html',
})

export class AudioPage {
  filename: any;
  curr_playing_file: MediaObject;
  storageDirectory: any;
  url: any;
  storageKey: string;
  isFavorite: boolean;
  radiolinks: Radiolinks;

  is_playing: boolean = false;
  is_in_play: boolean = false;
  is_ready: boolean = false;

  message: any;

  duration: any = -1;
  duration_string: string;
  position: any = 0;

  get_duration_interval: any;
  get_position_interval: any;

  errMess: string;

  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    private file: File,
    private media: Media,
    //public viewCtrl: ViewController,
    public favoriteProvider: FavoriteProvider,
    private http: HTTP,
    private restangular: Restangular) {
      // assign storage directory
      this.platform.ready().then(() => {
        if(this.platform.is('ios')) {
          this.storageDirectory = this.file.dataDirectory;
        } else if(this.platform.is('android')) {
          this.storageDirectory = this.file.externalDataDirectory;
        }
      });
      this.url = navParams.get('url');
      this.filename = navParams.get('title');
      let key = navParams.get('key');
      //determine the storageKey to use
      if(key === 'women'){
        this.storageKey = "women";
      }else if(key === 'men'){
        this.storageKey = "men";
      }else if(key === 'youth'){
        this.storageKey = "youth";
      }
  }

  ionViewWillEnter(){
    // comment out the following line when adjusting UI in browsers
    this.prepareAudioFile();
    this.prepareAudioResource().subscribe((data) => {
      console.log("links: " + data);
      this.radiolinks = data;
    }, errmess => {this.radiolinks = null; this.errMess = <any>errmess});
  }

  prepareAudioResource(): Observable<Radiolinks> {
    return this.restangular.one('radioresources').get();
  }

  prepareAudioFile() {
    //let url = "http://fabienne.sigonney.free.fr/tranquilit%E9/Eagles%20-%20Hotel%20California%20(Acoustic).mp3";
    this.platform.ready().then(() => {
      this.file.resolveDirectoryUrl(this.storageDirectory).then((resolvedDirectory) => {
        // inspired by: https://github.com/ionic-team/ionic-native/issues/1711
        console.log("resolved  directory: " + resolvedDirectory.nativeURL);
        this.file.checkFile(resolvedDirectory.nativeURL, this.filename + ".mp3").then((data) => {
          if(data == true) {  // exist
            this.getDurationAndSetToPlay();
          } else {  // not sure if File plugin will return false. go to download
            console.log("not found!");
            throw {code: 1, message: "NOT_FOUND_ERR"};
          }
        }).catch(err => {
          console.log("Error occurred while checking local files:");
          console.log(err);
          if(err.code == 1) {
            // not found! download!
            console.log("not found! download!");
            let loading = this.loadingCtrl.create({
              content: 'Downloading the recording...'
            });
            loading.present();
            //download and read file starts
            console.log("resolved directory 2: " + resolvedDirectory.nativeURL);
            this.http.downloadFile(
              this.url, 
              {}, 
              {}, 
              resolvedDirectory.nativeURL + this.filename + ".mp3"
            ).then((response) => {
                // prints the filename
                console.log(response.status);
                // prints the error
                console.log("response error: " + response.error);
                loading.dismiss();
                //insert info into db as downloaded/favourite content
                this.favoriteProvider.favoriteItem(this.storageKey, this.filename).then(() => {
                  this.isFavorite = true;
                });
                this.getDurationAndSetToPlay();
            }).catch(error => {
              console.log("Download error! " + error.status);
              loading.dismiss();
              console.log(error.error);
            });
          }
        });
      });
    });
  }

  createAudioFile(pathToDirectory, filename): MediaObject {
    if (this.platform.is('ios')) {  //ios
      return this.media.create((pathToDirectory).replace(/^file:\/\//, '') + '/' + filename);
    } else {  // android
      return this.media.create(pathToDirectory + filename);
    } 
  }

  getDurationAndSetToPlay() {
    this.curr_playing_file = this.createAudioFile(this.storageDirectory, this.filename + ".mp3");
    this.curr_playing_file.play();
    this.curr_playing_file.setVolume(0.0);  // you don't want users to notice that you are playing the file
    let self = this;
    this.get_duration_interval = setInterval(function() {
      if(self.duration == -1) {
        self.duration = ~~(self.curr_playing_file.getDuration());  // make it an integer
      } else {
        self.curr_playing_file.stop();
        self.curr_playing_file.release();
        self.setRecordingToPlay();
        clearInterval(self.get_duration_interval);
      }
    }, 100);
  }

  getAndSetCurrentAudioPosition() {
    let diff = 1;
    let self = this;
    this.get_position_interval = setInterval(function() {
      let last_position = self.position;
      self.curr_playing_file.getCurrentPosition().then((position) => {
        if (position >= 0 && position < self.duration) {
          if(Math.abs(last_position - position) >= diff) {
            // set position
            self.curr_playing_file.seekTo(last_position*1000);
          } else {
            // update position for display
            self.position = position;
          }
        } else if (position >= self.duration) {
          self.stopPlayRecording();
          self.setRecordingToPlay();
        }
      });
    }, 100);
  }

  setRecordingToPlay() {
    this.curr_playing_file = this.createAudioFile(this.storageDirectory, this.filename + ".mp3");
    this.curr_playing_file.onStatusUpdate.subscribe(status => {
      // 2: playing
      // 3: pause
      // 4: stop
      this.message = status;
      switch(status) {
        case 1:
          this.is_in_play = false;
          break;
        case 2:   // 2: playing
          this.is_in_play = true;
          this.is_playing = true;
          break;
        case 3:   // 3: pause
          this.is_in_play = true;
          this.is_playing = false;
          break;
        case 4:   // 4: stop
        default:
          this.is_in_play = false;
          this.is_playing = false;
          break;
      }
    })
    console.log("audio file set");
    this.message = "audio file set";
    this.is_ready = true;
    this.getAndSetCurrentAudioPosition();
  }

  playRecording() {
    this.curr_playing_file.play();
  }

  pausePlayRecording() {
    this.curr_playing_file.pause();
  }

  stopPlayRecording() {
    this.curr_playing_file.stop();
    this.curr_playing_file.release();
    clearInterval(this.get_position_interval);
    this.position = 0;
  }

  controlSeconds(action) {
    let step = 15;
    
    let number = this.position;
    switch(action) {
      case 'back':
        this.position = number < step ? 0.001 : number - step;
        break;
      case 'forward':
        this.position = number + step < this.duration ? number + step : this.duration;
        break;
      default:
        break;
    }
  }

/*  dismiss() {
    this.viewCtrl.dismiss();
  }*/

  ionViewWillLeave(){
    this.stopPlayRecording();
  }
}
