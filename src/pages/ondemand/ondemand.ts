import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RestangularModule, Restangular } from 'ngx-restangular';

import { Observable } from 'rxjs/Observable';
import { OnDemandCats } from '../shared/onDemandDesc';
import { OndemandcategoriesPage } from './ondemandcategories/ondemandcategories';

/**
 * Generated class for the OndemandPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage({})
@Component({
  selector: 'page-ondemand',
  templateUrl: 'ondemand.html',
})
export class OndemandPage {

  onDemandCategories: OnDemandCats[];
  errMess: string;

  constructor(public navCtrl: NavController, private restangular: Restangular, public navParams: NavParams) {
    this.getCategories().subscribe((data) => {
      console.log(data);
      this.onDemandCategories = data;
    }, errmess => {this.onDemandCategories = null; this.errMess = <any>errmess});
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OndemandPage');
  }

  getCategories(): Observable<OnDemandCats[]> {
    return this.restangular.all('ondemandcats').getList();
  }

  itemTapped(event, item) {
    if(item.page === "OndemandmenPage"){
      this.navCtrl.push(OndemandcategoriesPage, item);
    }else if(item.page === "OndemandwomenPage"){
      this.navCtrl.push(OndemandcategoriesPage, item);
    }else if(item.page === "OndemandyouthPage"){
      this.navCtrl.push(OndemandcategoriesPage, item);
    }
  }

}
