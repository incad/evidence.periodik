import { Component, OnInit } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { ActivatedRoute, Router, NavigationStart, NavigationEnd, NavigationExtras } from '@angular/router';

import { AppService } from './services/app.service';
import { SearchService } from './services/search.service';
import { AppState } from './app.state';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  pathObserver: Subscription;
  paramsObserver: Subscription;

  classes = {
    'home': 'app-page-home',
    'actual': 'app-page-actual',
    'o-casopisu': 'app-page-ocasopisu',
    'pro-autory': 'app-page-pokyny-pro-autory',
    'archiv': 'app-page-archiv-level-1',
    'article': 'app-page-archiv-reader',
    'hledat': 'app-page-search'
  };
  mainClass: string = this.classes['home'];
  pidActual: string;

  constructor(
    public state: AppState,
    private service: AppService,
    private searchService: SearchService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router) {

  }


  ngOnInit() {

    this.getConfig().subscribe(
      cfg => {

        this.state.stateChangedSubject.subscribe(route => { 
          this.stateChanged(route) ;
          });
          
        this.state.classChangedSubject.subscribe(() => { 
          this.classChanged() ;
          });

        this.processUrl();
      }
    );
  }

  getConfig() {
    return this.http.get("assets/config.json").map(res => {
      let cfg = res;

      this.state.setConfig(cfg);
      this.state.rows = cfg['searchParams']['rows'];
      this.state.sorts = cfg['sorts'];
      this.state.currentSort = cfg[0];
      var userLang = navigator.language.split('-')[0]; // use navigator lang if available
      userLang = /(cs|en)/gi.test(userLang) ? userLang : 'cs';
      if (cfg.hasOwnProperty('defaultLang')) {
        userLang = cfg['defaultLang'];
      }
      this.service.changeLang(userLang);
      
      this.findActual();
      this.getKeywords();
      this.getGenres();
      //this._configSubject.next(cfg);
      //this.processUrl();
      this.state.stateChanged();
      return this.state.config;
    });
  }
  
  getGenres() {
      //Rok jako stats
      var params = new HttpParams()
      .set('q', '*:*')
      .set('fq', '-genre:""')
      .set('fq', 'model:article')
      .set('rows', '0')
      .set('facet', 'true')
      .set('facet.field', 'genre')
      .set('facet.mincount', '1')
      .set('facet.sort', 'index');
      this.searchService.search(params).subscribe(res => {

        this.state.genres= [];
        for(let i in res['facet_counts']['facet_fields']['genre']){
          let genre = res['facet_counts']['facet_fields']['genre'][i][0];
          if(!this.service.isHiddenByGenre([genre])){
            //this.state.genres.push(genre);
            let tr: string = this.service.translateKey('genre.' + genre);
            this.state.genres.push({val: genre, tr: tr});
          }
        }
        this.state.genres.sort((a, b) => {
          return a.tr.localeCompare(b.tr, 'cs');
        });

      });
    
  }
  
  getKeywords(){
    var params = new HttpParams()
    .set('q', '*:*')
    .set('rows', '0')
    .set('facet', 'true')
    .set('facet.field', 'keywords_facet')
    .set('facet.mincount', '1')
    .set('facet.limit', '-1')
    .set('facet.sort', 'index');
      this.searchService.search(params).subscribe(res => {
        this.state.keywords= [];
        
        for(let i in res['facet_counts']['facet_fields']['keywords_facet']){
          let val: string = res['facet_counts']['facet_fields']['keywords_facet'][i][0];
          if(val && val !== ''){
            let val_lower: string = val.toLocaleLowerCase(); 
            this.state.keywords.push({val: val, val_lower: val_lower});
          }
        }
        
        this.state.keywords.sort((a, b) => {
          return a.val_lower.localeCompare(b.val_lower, 'cs');
        });

      });
  }
  
  
  findActual(){
    this.pidActual = null;
    this.findActualByPid(this.state.config['journal']);
  }
  
  findActualByPid(pid: string){
    this.service.getChildren(pid).subscribe(res => {
      if(res.length === 0){
        this.pidActual = null;
        console.log('ERROR. Cannot find actual number');
      } else if(res[0]['datanode']){
        this.pidActual = pid;
        this.service.getJournal(pid).subscribe(a => {
          this.state.setActual(a);
          this.service.getArticles(this.state.actualNumber['pid']).subscribe(res => {
            this.state.actualNumber.setArticles(res, this.state.config['mergeGenres']);
            //this.service.getMods(this.state.actualNumber['pid']).subscribe(mods => this.state.actualNumber.mods = mods);
            this.state.stateChanged();
          });
        });
      } else {
        this.findActualByPid(res[0]['pid']);
      }
    });
  }

  processUrl() {
    //this.searchService.getActual();
    this.setMainClass(this.router.url);
    this.pathObserver = this.router.events.subscribe(val => {
      //console.log('pathObserver', val);
      if (val instanceof NavigationEnd) {
        this.state.paramsChanged();
        this.setMainClass(val.url);
      } else if (val instanceof NavigationStart) {
        this.state.clear();
      }
    });
    
//    this.route..subscribe(data => {
//      console.log(this.route.outlet);
//    });

    this.paramsObserver = this.route.queryParams.subscribe(searchParams => {
      this.processUrlParams(searchParams);
    });

    this.state.paramsChanged();
  }

  setMainClass(url: string) {
    let p = url.split('/');
    this.state.route = p[1].split(';')[0];
    this.state.mainClass = this.classes[this.state.route];
    this.mainClass = this.classes[this.state.route];
  }

  processUrlParams(searchParams) {
    for (let p in searchParams) {

    }
  }

  //Called when changing state
  stateChanged(route: string) {
    this.setUrl(route);
  }
  
  classChanged(){
    this.mainClass = this.state.mainClass;
  }

  setUrl(route: string) {

  }

}
