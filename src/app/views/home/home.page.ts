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

    this.sqlite.create(this.name, this.address, this.status).then(() => {
      this.name = "";
      this.address = "";
      this.status = "pendente";
      this.read();

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
          }
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.sqlite.delete(id).then(() => {
              this.read();
              this.isToastOpen = true;
            }).catch(err => console.error("erro ao apagar:", err));
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

      }
    } catch (error) {
      console.error('erro ao tirar foto:', error);
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
  }

  setSelectedItem(item: Item) {
    this.selectedItem = item;
  }


  async completeOrder() {
    if (!this.selectedItem) {
      return;
    }

    const validStatuses = ['entregue', 'pendente'];
    if (!validStatuses.includes(this.selectedItem.status)) {
      return;
    }

    if (this.images.length === 0) {
      return;
    }

    try {
      const lastImage = this.images[this.images.length - 1];

      await this.sqlite.update(
        this.selectedItem.id,
        this.selectedItem.name,
        this.selectedItem.address,
        'entregue',
        lastImage.data
      );


      this.images = [];
      this.selectedItem.status = 'entregue';

      this.read();

      this.selectedItem = null;

      await this.modalCtrl.dismiss();
    } catch (error) {
      console.error("erro ao salvar a foto:", error);
    }
  }

  toggleHeader() {
    this.showInputs = !this.showInputs;
  }

  viewDetails(item: Item) {
    this.router.navigate(['/item-details', item.id]);
  }
}

