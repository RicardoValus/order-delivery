import { Component } from '@angular/core';
import { SqliteService } from '../../services/sqlite.service';
import { Router } from '@angular/router';

interface Item {
  id: number;
  name: string;
  address: string;
  status: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public items: Item[] = [];
  public filteredItems: Item[] = [];
  public name: string = "";
  public address: string = "";
  public status: string = "pendente";
  public filterStatus: string = "todos"; 

  constructor(
    private sqlite: SqliteService,
    private router: Router
  ) {
    this.items = [];
    this.name = "";
    this.address = "";
    this.status = "pendente";
  }


  ionViewWillEnter() {
    this.read();
  }

  read() {
    this.sqlite.read().then((items: Item[]) => {
      this.items = items;
      this.filterItems();
    }).catch(err => console.error("erro ao ler:", err));
  }

  filterItems() {
    if (this.filterStatus === 'todos') {
      this.filteredItems = [...this.items];
    } else {
      this.filteredItems = this.items.filter(item => item.status === this.filterStatus);
    }
  }

  create() {
    this.sqlite.create(this.name, this.address, this.status).then(() => {
      this.name = "";
      this.address = "";
      this.status = "pendente";
      this.read();
    }).catch(err => console.error("erro ao criar:", err));
  }

  update(item: Item) {
    this.router.navigate(['/edit', item.id]); 
  }

  delete(id: number) {
    this.sqlite.delete(id).then(() => {
      this.read();
    }).catch(err => console.error("erro ao apagar:", err));
  }

  conclude(item: Item) {
    item.status = 'entregue';
    
    this.sqlite.update(item.id, item.name, item.address, item.status).then(() => {
      console.log("pedido concluído:", item);
      this.read();
    }).catch(err => console.error("erro ao concluir pedido:", err));
  }
  
}

