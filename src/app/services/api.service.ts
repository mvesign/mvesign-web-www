import {Injectable} from "@angular/core";
import {HttpClient, HttpResponse} from "@angular/common/http";
import "rxjs/add/operator/catch";
import 'rxjs/add/observable/throw';
import {Observable, ObservableInput} from "rxjs/Observable";
import {IArticle, IArticleSummary} from "./api.interface";
import {environment} from "../../environments/environment";

@Injectable()
export class ApiService {
    private defaultConfig = {
        withCredentials: false
    };

    constructor(private http: HttpClient) {
    }

    retrieveArticle(reference: string): Observable<IArticle> {
        return this.http.get<IArticle>(environment.API_URL + `articles/` + reference, this.defaultConfig)
            .catch((error: Response) : Observable<any> => {
                return Observable.throw(`Could not retrieve article for reference '` + reference + `'.`);
            });
    }

    retrieveArticles(): Observable<IArticle[]> {
        return this.http.get<IArticle[]>(environment.API_URL + `articles`, this.defaultConfig)
            .catch((error: Response): ObservableInput<any> => {
                return Observable.throw("Could not retrieve articles.");
            });
    }

    retrieveArticlesByTag(tag: string): Observable<IArticle[]> {
        return this.http.get<IArticle[]>(environment.API_URL + `tags/` + tag, this.defaultConfig)
            .catch((error: Response): ObservableInput<any> => {
                return Observable.throw("Could not retrieve articles by tag.");
            });
    }

    retrieveArticleSummary(): Observable<IArticleSummary> {
        return this.http.get<IArticleSummary>(environment.API_URL + `summary/articles`, this.defaultConfig)
            .catch((error: Response): ObservableInput<any> => {
                return Observable.throw("Could not retrieve summary of articles.");
            });
    }

    retrieveArticleSummaryByTag(tag: string): Observable<IArticleSummary> {
        return this.http.get<IArticleSummary>(environment.API_URL + `summary/tags/` + tag, this.defaultConfig)
            .catch((error: Response): ObservableInput<any> => {
                return Observable.throw("Could not retrieve summary of articles.");
            });
    }
}