import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SqliteService } from 'src/app/services/sqlite.service';

interface Item {
  id: number;
  name: string;
  address: string;
  status: string;
}

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit {
  id: number;
  name: string;
  address: string;
  status: string;
  originalItem: any;
  public items: Item[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sqlite: SqliteService
  ) { }

  ngOnInit() {
    const itemId = this.route.snapshot.paramMap.get('id');

    if (itemId) {
      this.id = parseInt(itemId, 10);
      this.sqlite.getItemById(this.id).then((item) => {
        if (item) {
          this.name = item.name;
          this.address = item.address;
          this.status = item.status;
          this.originalItem = { ...item };
        }
      }).catch(err => {
        console.error("erro ao carregar item:", err);
      });
    } else {
      console.error("id não encontrado na rota");
    }
  }

  save() {
    console.log("salvando item com id:", this.id);

    if (!this.id) {
      console.error("erro: id indefinido");
      return;
    }

    const updatedItem = {
      id: this.id,
      name: this.name,
      address: this.address,
      status: this.status
    };

    this.sqlite.update(updatedItem.id, updatedItem.name, updatedItem.address, updatedItem.status)
      .then((changes) => {
        console.log("atualizado: ", changes);
        this.read();
        this.router.navigate(['/']);
      })
      .catch(err => {
        console.error("erro ao atualizar: ", err);
      });
  }

  read() {
    this.sqlite.read().then((items: Item[]) => {
      this.items = items;
    }).catch(err => console.error("erro ao ler:", err));
  }

}
