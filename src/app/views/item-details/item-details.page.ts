import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SqliteService } from 'src/app/services/sqlite.service';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.page.html',
  styleUrls: ['./item-details.page.scss'],
})
export class ItemDetailsPage implements OnInit {
  itemId: number | null = null;
  item: any = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private sqlite: SqliteService,
    private location: Location
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.itemId = +params.get('id')!;
      if (this.itemId) {
        this.loadItemDetails();
      }
    });
  }

  loadItemDetails() {
    this.sqlite.getItemById(this.itemId).then(item => {
      this.item = item;
    }).catch(err => console.error('Erro ao carregar item:', err));
  }

  back() {
    this.location.back();
  }
}