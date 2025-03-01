import { Component, ViewChild } from '@angular/core';
import { SqliteService } from '../../services/sqlite.service';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera'

interface Item {
  id: number;
  name: string;
  address: string;
  status: string;
  photo?: string;
}

interface LocalFile {
  name: string;
  path: string;
  data: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  @ViewChild('modal') modal: any;

  public items: Item[] = [];
  public filteredItems: Item[] = [];
  public name: string = "";
  public address: string = "";
  public status: string = "pendente";
  public filterStatus: string = "todos";
  showInputs: boolean = true;
  images: LocalFile[] = [];
  selectedItem: Item | null = null;
  public isToastOpen = false;
  public isToastOpenCreate = false;

  constructor(
    private sqlite: SqliteService,
    private router: Router,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
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
    if (!this.name || !this.address || !this.status) {
      this.showAlert('Todos os campos precisam ser preenchidos.');
      return;
    }

    // Verificar se o nome já existe
    const itemExists = this.items.some(item => item.name.toLowerCase() === this.name.toLowerCase());

    if (itemExists) {
      this.showAlert('Já existe um pedido com esse nome.');
      return;
    }

    this.sqlite.create(this.name, this.address, this.status).then(() => {
      this.name = "";
      this.address = "";
      this.status = "pendente";
      this.read(); // Atualiza a lista de itens após a criação

      // Exibe o toast de sucesso
      this.isToastOpenCreate = true;
    }).catch(err => console.error("erro ao criar:", err));
  }



  async showAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Erro',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  update(item: Item) {
    this.router.navigate(['/edit', item.id]);
  }

  async delete(id: number) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir este item?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Exclusão cancelada');
          }
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.sqlite.delete(id).then(() => {
              this.read(); // Atualiza a lista de itens
              this.isToastOpen = true; // Exibe o toast após exclusão
            }).catch(err => console.error("Erro ao apagar:", err));
          }
        }
      ]
    });

    await alert.present();
  }

  handleToastDismiss(type: string) {
    if (type === 'create') {
      this.isToastOpenCreate = false;
    }
    if (type === 'delete') {
      this.isToastOpen = false;
    }
  }




  conclude(item: Item) {
    item.status = 'entregue';

    this.sqlite.update(item.id, item.name, item.address, item.status, item.photo).then(() => {
      console.log("pedido concluído:", item);
      this.read();
    }).catch(err => console.error("erro ao concluir pedido:", err));

  }

  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        saveToGallery: true
      });

      if (image) {
        const response = await fetch(image.webPath || '');
        const blob = await response.blob();
        const base64Data = await this.convertBlobToBase64(blob) as string;

        const fileName = new Date().getTime() + '.jpeg';

        this.images.push({
          name: fileName,
          path: image.webPath || '',
          data: base64Data
        });

        console.log('Imagens no array:', this.images);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
    }
  }

  convertBlobToBase64 = (blob: Blob) => new Promise(
    (resolve, reject) => {
      const reader = new FileReader;
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

  async deleteImage(file: LocalFile) {
    this.images = this.images.filter(img => img !== file);
    console.log('Imagens após deletar:', this.images);
  }

  setSelectedItem(item: Item) {
    this.selectedItem = item;
    console.log("Item selecionado:", this.selectedItem);
  }


  async completeOrder() {
    if (!this.selectedItem) {
      console.log("Erro: Nenhum item selecionado.");
      return;
    }

    const validStatuses = ['entregue', 'pendente'];
    if (!validStatuses.includes(this.selectedItem.status)) {
      console.log("Erro: Status inválido.");
      return;
    }

    if (this.images.length === 0) {
      console.log("Tire uma foto antes de finalizar!");
      return;
    }

    try {
      const lastImage = this.images[this.images.length - 1];

      // Atualiza o pedido com a foto e status 'entregue'
      await this.sqlite.update(
        this.selectedItem.id,
        this.selectedItem.name,
        this.selectedItem.address,
        'entregue',  // Aqui o status está sendo diretamente passado como 'entregue'
        lastImage.data // A foto do último item no array
      );

      console.log("Pedido concluído com foto salva!");

      this.images = [];
      this.selectedItem.status = 'entregue';  // Confirme que o status está correto aqui

      // Atualiza o item na lista
      this.read();

      this.selectedItem = null;

      await this.modalCtrl.dismiss();
    } catch (error) {
      console.error("Erro ao salvar a foto:", error);
      console.log("Erro ao salvar a foto no banco.");
    }
  }

  toggleHeader() {
    this.showInputs = !this.showInputs;
  }

  viewDetails(item: Item) {
    this.router.navigate(['/item-details', item.id]);
  }
}

