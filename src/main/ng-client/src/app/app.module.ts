import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http } from '@angular/http';
import { HttpClientModule, HttpClient} from '@angular/common/http';
import { RouterModule } from '@angular/router';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { MaterializeModule } from 'ng2-materialize';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CalendarModule } from "ap-angular2-fullcalendar";

import { AppState } from './app.state';
import { AppService } from './app.service';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CalendarComponent } from './components/calendar/calendar.component';
//import { KalendarFullComponent } from './components/kalendar-full/kalendar-full.component';
import { IssueComponent } from './components/issue/issue.component';
import { FacetComponent } from './components/facet/facet.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { HomeComponent } from './components/home/home.component';
import { ResultComponent } from './components/result/result.component';
import { ResultItemComponent } from './components/result/result-item/result-item.component';
import { CalendarMonthComponent } from './components/calendar/calendar-month/calendar-month.component';
import { CalendarYearComponent } from './components/calendar/calendar-year/calendar-year.component';
import { CalendarListComponent } from './components/calendar/calendar-list/calendar-list.component';
import { CalendarMonthDayComponent } from './components/calendar/calendar-month/calendar-month-day/calendar-month-day.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    CalendarComponent,
    //KalendarFullComponent,
    IssueComponent,
    FacetComponent,
    ToolbarComponent,
    SearchBarComponent,
    HomeComponent,
    ResultComponent,
    ResultItemComponent,
    CalendarMonthComponent,
    CalendarYearComponent,
    CalendarListComponent,
    CalendarMonthDayComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    MaterializeModule.forRoot(),
    BrowserAnimationsModule,
    CalendarModule,
    
    RouterModule.forRoot([
      { path: 'issue', component: IssueComponent },
      { path: 'issue/:id', component: IssueComponent },
      { path: 'home', component: HomeComponent },
      { path: 'result', component: ResultComponent },
      { path: 'calendar', component: CalendarComponent, 
        children: [
          { path: '', redirectTo: 'month', pathMatch: 'full' },
          { path: 'month', component: CalendarMonthComponent },
          { path: 'year', component: CalendarYearComponent },
          { path: 'list', component: CalendarListComponent }
        ]
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ])
  ],
  providers: [HttpClient, DatePipe, AppState, AppService],
  bootstrap: [AppComponent]
})
export class AppModule { }