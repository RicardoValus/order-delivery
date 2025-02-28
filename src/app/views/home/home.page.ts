import { Component } from '@angular/core';
import { SqliteService } from '../../services/sqlite.service';
import { Router } from '@angular/router';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera'

// import { Directory, Filesystem } from '@capacitor/filesystem';

interface Item {
  id: number;
  name: string;
  address: string;
  status: string;
}

const IMAGE_DIR = 'stored-images';

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

  public items: Item[] = [];
  public filteredItems: Item[] = [];
  public name: string = "";
  public address: string = "";
  public status: string = "pendente";
  public filterStatus: string = "todos";
  showInputs: boolean = true;

  images: LocalFile[] = [];

  constructor(
    private sqlite: SqliteService,
    private router: Router,
    private platform: Platform,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
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
              this.read();
            }).catch(err => console.error("Erro ao apagar:", err));
          }
        }
      ]
    });

    await alert.present();
  }


  conclude(item: Item) {
    item.status = 'entregue';

    this.sqlite.update(item.id, item.name, item.address, item.status).then(() => {
      console.log("pedido concluído:", item);
      this.read();
    }).catch(err => console.error("erro ao concluir pedido:", err));


    // this.loadFiles();
  }

  // async loadFiles() {
  //   this.images = [];
  //   const loading = await this.loadingCtrl.create({
  //     message: 'Carregando dados...',
  //   });
  //   await loading.present();

  //   // Filesystem.readdir({
  //   //   directory: Directory.Data,
  //   //   path: IMAGE_DIR
  //   // }).then(async (result) => {
  //   //   // console.log('AQUI: ', result);
  //   //   // this.loadFileData(result.files);
  //   //   const fileNames = result.files.map(file => file.name); // extrai os nomes dos arquivos
  //   //   await this.loadFileData(fileNames);
  //   // }, async (err) => {
  //   //   console.log('err: ', err);
  //   //   await Filesystem.mkdir({
  //   //     directory: Directory.Data,
  //   //     path: IMAGE_DIR
  //   //   });
  //   // }).then(() => {
  //   //   loading.dismiss();
  //   // });
  // }

  // async loadFiles() {
  //   this.images = [];
  //   const loading = await this.loadingCtrl.create({
  //     message: 'Carregando dados...',
  //   });
  //   await loading.present();

  //   try {
  //     const result = await Filesystem.readdir({
  //       directory: Directory.Data,
  //       path: IMAGE_DIR
  //     });

  //     const fileNames = result.files.map(file => file.name);
  //     await this.loadFileData(fileNames);
  //   } catch (err) {
  //     console.log('Erro ao carregar imagens:', err);
  //     await Filesystem.mkdir({
  //       directory: Directory.Data,
  //       path: IMAGE_DIR
  //     });
  //   }

  //   await loading.dismiss();
  // }



  async loadFileData(fileNames: string[]) {
    for (let f of fileNames) {
      const filePath = `${IMAGE_DIR}/${f}`;

      // const readFile = await Filesystem.readFile({
      //   directory: Directory.Data,
      //   path: filePath
      // });

      // this.images.push({
      //   name: f,
      //   path: filePath,
      //   data: `data:image/jpeg;base64,${readFile.data}`
      // })

      // console.log('LER: ', readFile);
    }
  }

  async selectImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      saveToGallery: true
    });

    if (image) {
      const fileName = new Date().getTime() + '.jpeg';
      const imageData = image.webPath || '';  // 'webPath' é a URL da imagem que pode ser usada diretamente no <img>

      // Adiciona a imagem ao array de imagens
      this.images.push({
        name: fileName,
        path: imageData,
        data: imageData
      });

      // Log para conferir se a imagem foi salva no array
      console.log('Imagens no array:', this.images);
    }
  }


  async saveImage(photo: Photo) {
    // const base64Data = await this.readAsBase64(photo);
    // console.log(base64Data);
    const fileName = new Date().getTime() + '.jpeg';

    // const savedFile = await Filesystem.writeFile({
    //   directory: Directory.Data,
    //   path: `${IMAGE_DIR}/${fileName}`,
    //   data: base64Data
    // });

    // console.log('Salvo: ', savedFile);

    // this.loadFiles();
  }

  // async readAsBase64(photo: Photo) {

  //   if (this.platform.is('hybrid')) {

  //     // const file = await Filesystem.readFile({
  //     //   path: photo.path!
  //     // });

  //     // return file.data;
  //   }
  //   else {

  //     const response = await fetch(photo.webPath!);
  //     const blob = await response.blob();

  //     return await this.convertBlobToBase64(blob) as string;
  //   }
  // }

  convertBlobToBase64 = (blob: Blob) => new Promise(
    (resolve, reject) => {
      const reader = new FileReader;
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

  async startUpload(file: LocalFile) {
    const response = await fetch(file.data);
    // console.log(" ~file: home.page.ts ~ linha 138 ~ HomePage ~ startUpload ~ response", response);
    const blob = await response.blob();
    // console.log(" ~ file: home.page.ts ~ linha 140 ~ HomePage ~ startUpload ~ blob", blob)
  }

  async deleteImage(file: LocalFile) {
    this.images = this.images.filter(img => img !== file);
    console.log('Imagens após deletar:', this.images);
  }


  async completeOrder() {

  }

  toggleHeader() {
    this.showInputs = !this.showInputs;
  }

}

