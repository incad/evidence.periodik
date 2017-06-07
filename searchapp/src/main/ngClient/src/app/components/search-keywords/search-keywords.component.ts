import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { URLSearchParams } from '@angular/http';
import { SearchService } from '../../services/search.service';
import { AppState } from '../../app.state';
import { Criterium } from '../../models/criterium';

@Component({
  selector: 'app-search-keywords',
  templateUrl: './search-keywords.component.html',
  styleUrls: ['./search-keywords.component.scss']
})
export class SearchKeywordsComponent implements OnInit, OnDestroy {


  subscriptions: Subscription[] = [];

  public keywords: any[] = [];
  public keywordsFiltered: any[] = [];
  public keywords1: any[];
  public keywords2: any[];

  rowsPerCol: number = 10;
  letter: string = null;
  page: number = 0;
  totalPages: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private searchService: SearchService,
    public state: AppState) { }

  ngOnInit() {
    this.getKeywords();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }


  getKeywords() {
    if (this.state.config) {
      var params = new URLSearchParams();
      params.set('q', '*:*');
      //    params.set('fq', '-genre:""');
      params.set('rows', '0');
      //Rok jako stats
      params.set('facet', 'true');
      params.set('facet.field', 'keywords');
      params.set('facet.mincount', '1');
      params.set('facet.limit', '-1');
      params.set('facet.sort', 'index');
      this.searchService.search(params).subscribe(res => {

        this.keywords = res['facet_counts']['facet_fields']['keywords'];
        this.filter();

      });
    } else {

      this.subscriptions.push(this.state.stateChangedSubject.subscribe(
        () => {
          this.getKeywords();
        }
      ));
    }
  }

  setLetter(l: string) {
    this.letter = l;
    this.filter();
  }

  setPage(p: number) {
    this.page = p;
    this.setCols();
  }

  isEmpty(l: string) {
    if (this.keywords.length === 0) {
      return true;
    }
    let has = false;
    this.keywords.forEach((el) => {
      let k: string = el[0];
      if (k.toLocaleLowerCase().charAt(0) === l.toLocaleLowerCase()) {
        has = true;
        return;
      }
    });
    return !has;
  }

  filter() {
    this.keywordsFiltered = [];
    if (this.letter !== null) {

      this.keywords.forEach((el) => {
        //        console.log(el);
        let k: string = el[0];
        if (k.toLocaleLowerCase().charAt(0) === this.letter.toLocaleLowerCase()) {
          this.keywordsFiltered.push(el);
        }
      });
    } else {
      this.keywordsFiltered = this.keywords;
    }
    this.totalPages = Math.floor(this.keywordsFiltered.length / this.rowsPerCol);
    this.setCols();
  }

  setCols() {
    this.keywords1 = [];
    this.keywords2 = [];
    let min: number = this.page * this.rowsPerCol;
    let max: number = Math.min(min + this.rowsPerCol, this.keywordsFiltered.length);
    for (let i = min; i < max; i++) {
      this.keywords1.push(this.keywordsFiltered[i]);
    }
    min = (this.page + 1) * this.rowsPerCol;
    max = Math.min(min + this.rowsPerCol, this.keywordsFiltered.length);
    for (let i = min; i < max; i++) {
      this.keywords2.push(this.keywordsFiltered[i]);
    }
  }

  search(s: string) {
    let c = new Criterium();
    c.field = 'keywords';
    c.value = '"' + s + '"';
    this.router.navigate(['/hledat/cokoliv', { criteria: JSON.stringify([c]), start: 0 }])
  }
}
