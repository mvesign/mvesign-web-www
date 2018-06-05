import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.css']
})
export class TagComponent implements OnInit, OnDestroy {
  public tag: string;
  public routeSubscription: any;

  constructor(private route: ActivatedRoute) {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.tag = params['id'];
   });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }
}