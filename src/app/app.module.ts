import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpModule} from "@angular/http";
import {HttpClientModule} from "@angular/common/http";
import {RouteReuseStrategy} from '@angular/router';
import {MatGridListModule} from '@angular/material/grid-list';
import { PrismModule } from '@sgbj/angular-prism';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {AppRouteReuseModule} from './app-routing-reuse.module';

import {UrlEncodePipe} from './pipes/url-encode.pipe';

import {ApiService} from './services/api.service';

import {ArticleComponent} from './components/article/article.component';
import {ArticlesComponent} from './components/articles/articles.component';
import {TagComponent} from './components/tag/tag.component';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    MatGridListModule,
    AppRoutingModule,
    PrismModule
  ],
  declarations: [
    AppComponent,
    ArticleComponent,
    ArticlesComponent,
    UrlEncodePipe,
    TagComponent
  ],
  providers: [
    ApiService,
    {
      provide: RouteReuseStrategy,
      useClass: AppRouteReuseModule
    }
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
}