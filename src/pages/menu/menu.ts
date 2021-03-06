import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
//import { ScreenOrientation } from '@ionic-native/screen-orientation';

@IonicPage({})
@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage {
  jsonStorageKey: string = 'appJsonList';
  homePage: any;
  @ViewChild('content') childNavCtrl: NavController;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    //private screenOrientation: ScreenOrientation
  ) {
    //this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    this.homePage = 'HomePage';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MenuPage');
  }

  openPage(pageName: String){
    if(pageName === "devotions"){
      this.childNavCtrl.setRoot('DevotionsPage');
    }else if(pageName === "exhortations"){
      this.childNavCtrl.setRoot('ExhortationsPage');
    }else if(pageName === "radio"){
      this.childNavCtrl.setRoot('RadioPage');
    }else if(pageName === "ondemand"){
      this.childNavCtrl.setRoot('OndemandPage');
    }else if(pageName === "magazines"){
      this.childNavCtrl.setRoot('MagazinesPage');
    }else if(pageName === "video"){
      this.childNavCtrl.setRoot('VideoPage');
    }else if(pageName === "aboutus"){
      this.childNavCtrl.setRoot('AboutusPage');
    }else if(pageName === "testimonies"){
      this.childNavCtrl.setRoot('TestimonyPage');
    }else if(pageName === "home"){
      this.childNavCtrl.setRoot('HomePage');
    }
  }

}
