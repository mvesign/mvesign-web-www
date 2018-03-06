import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpModule} from "@angular/http";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {RouteReuseStrategy} from '@angular/router';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatCheckboxModule} from '@angular/material';
import {MatGridListModule} from '@angular/material/grid-list';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {AppRouteReuseModule} from './app-routing-reuse.module';

import {ApiService} from './services/api.service';

import {ArticleComponent} from './components/article/article.component';
import {ArticlesComponent} from './components/articles/articles.component';
import {UrlEncodePipe} from './pipes/url-encode.pipe';
import { TagComponent } from './components/tag/tag.component';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    NoopAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatGridListModule,
    AppRoutingModule
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