import { ChangeDetectorRef, Component } from '@angular/core';

import { collection, addDoc } from 'firebase/firestore';

import { ToastController } from '@ionic/angular';

import { db } from '../firebase';

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {
  // =========================
  // NEW BOOK
  // =========================

  newBook = {
    title: '',
    author: '',
    category: '',
    year: new Date().getFullYear(),
    rating: 5,
    status: 'Want to Read',
    notes: '',
  };

  // =========================
  // LOADING
  // =========================

  isLoading: boolean = false;

  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private toastController: ToastController,
    private changeDetector: ChangeDetectorRef,
  ) {}

  // =========================
  // ADD BOOK
  // =========================

  async addBook() {
    console.log('Add Book button clicked');

    // =========================
    // VALIDATION
    // =========================

    if (
      !this.newBook.title.trim() ||
      !this.newBook.author.trim() ||
      !this.newBook.category.trim() ||
      !this.newBook.year
    ) {
      await this.showToast('Please fill in all required fields.', 'warning');

      return;
    }

    const year = Number(this.newBook.year);

    const rating = Number(this.newBook.rating);

    // =========================
    // YEAR VALIDATION
    // =========================

    if (isNaN(year) || year < 1000 || year > 2100) {
      await this.showToast('Please enter a valid publication year.', 'warning');

      return;
    }

    // =========================
    // RATING VALIDATION
    // =========================

    if (isNaN(rating) || rating < 1 || rating > 10) {
      await this.showToast('Rating must be between 1 and 10.', 'warning');

      return;
    }

    // =========================
    // START LOADING
    // =========================

    this.isLoading = true;

    this.changeDetector.detectChanges();

    // =========================
    // ADD BOOK TO FIRESTORE
    // =========================

    try {
      const booksCollection = collection(db, 'books');

      const bookDocument = await addDoc(booksCollection, {
        title: this.newBook.title.trim(),

        author: this.newBook.author.trim(),

        category: this.newBook.category.trim(),

        year: year,

        rating: rating,

        status: this.newBook.status,

        notes: this.newBook.notes.trim(),
      });

      console.log('Book added to Firestore:', bookDocument.id);

      // =========================
      // RESET FORM
      // =========================

      this.resetForm();

      // =========================
      // SUCCESS TOAST
      // =========================

      await this.showToast('Book added successfully!', 'success');
    } catch (error) {
      console.error('Firestore Error:', error);

      await this.showToast('Failed to add book.', 'danger');
    } finally {
      // =========================
      // STOP LOADING
      // =========================

      this.isLoading = false;

      this.changeDetector.detectChanges();

      console.log('LOADING FINISHED:', this.isLoading);
    }
  }

  // =========================
  // RESET FORM
  // =========================

  resetForm() {
    this.newBook = {
      title: '',

      author: '',

      category: '',

      year: new Date().getFullYear(),

      rating: 5,

      status: 'Want to Read',

      notes: '',
    };

    this.changeDetector.detectChanges();
  }

  // =========================
  // TOAST
  // =========================

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,

      duration: 2500,

      position: 'bottom',

      color: color,

      buttons: [
        {
          text: 'OK',
          role: 'cancel',
        },
      ],
    });

    await toast.present();
  }
}
