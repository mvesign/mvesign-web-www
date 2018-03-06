import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from '../../services/api.service';
import {IArticle, IArticleSummary} from '../../services/api.interface';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit, OnDestroy {
  private article: IArticle;
  private routeSubscription: any;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {
  }

  ngOnInit() {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.retrieveArticleByReference(params['id']);
   });
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }

  retrieveArticleByReference(
    reference: string
  ) {
    this.apiService.retrieveArticle(reference).subscribe((article: IArticle) => {
      this.article = article;
    });
  }
}