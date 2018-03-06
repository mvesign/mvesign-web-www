import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {ArticleComponent} from './components/article/article.component';
import {ArticlesComponent} from './components/articles/articles.component';
import {TagComponent} from './components/tag/tag.component';

const routes: Routes = [
    { path: '', component: ArticlesComponent, pathMatch: 'full' },
    { path: 'article/:id', component: ArticleComponent },
    { path: 'tag/:id', component: TagComponent }
];
   
@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {
}