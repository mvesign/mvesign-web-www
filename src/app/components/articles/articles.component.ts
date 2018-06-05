import {Component, OnInit, Input} from '@angular/core';
import {ApiService} from '../../services/api.service';
import {IArticle, IArticleSummary} from '../../services/api.interface';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {
  public articles: IArticle[];
  public articleSummary: IArticleSummary;

  @Input() public tag?: string;

  constructor(
    private apiService: ApiService
  ) {
  }

  ngOnInit() {
    this.retrieveArticles();
    this.retrieveArtcileSummary();
  }

  retrieveArticles() {
    if (this.tag != null) {
      this.apiService.retrieveArticlesByTag(this.tag).subscribe((articles: IArticle[]) => {
        this.articles = articles;
      });
    }
    else {
      this.apiService.retrieveArticles().subscribe((articles: IArticle[]) => {
        this.articles = articles;
      });
    }
  }

  retrieveArtcileSummary() {
    if (this.tag != null) {
      this.apiService.retrieveArticleSummaryByTag(this.tag).subscribe((articleSummary: IArticleSummary) => {
        this.articleSummary = articleSummary;
      });
    }
    else {
      this.apiService.retrieveArticleSummary().subscribe((articleSummary: IArticleSummary) => {
        this.articleSummary = articleSummary;
      });
    }
  }
}