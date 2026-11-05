import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';

import { ToastController } from '@ionic/angular';

import { db } from '../firebase';

interface Book {
  id?: string;
  title: string;
  author: string;
  category: string;
  year: number;
  rating: number;
  status: string;
  notes: string;
}

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  // =========================
  // BOOKS
  // =========================

  books: Book[] = [];

  filteredBooks: Book[] = [];

  // =========================
  // SEARCH
  // =========================

  searchTerm: string = '';

  // =========================
  // STATUS FILTER
  // =========================

  selectedStatus: string = 'ALL';

  // =========================
  // LOADING
  // =========================

  isLoading: boolean = false;

  // =========================
  // EDIT MODAL
  // =========================

  isEditModalOpen: boolean = false;

  editingBook: Book = {
    title: '',
    author: '',
    category: '',
    year: new Date().getFullYear(),
    rating: 5,
    status: 'Want to Read',
    notes: '',
  };

  // =========================
  // SWIPE
  // =========================

  swipedBookId: string | undefined = undefined;

  private swipeStartX: number = 0;

  private swipeCurrentX: number = 0;

  private isSwiping: boolean = false;

  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private toastController: ToastController,
    private changeDetector: ChangeDetectorRef,
  ) {}

  // =========================
  // ON INIT
  // =========================

  ngOnInit() {
    this.loadBooks();
  }

  // =========================
  // LOAD BOOKS
  // =========================

  async loadBooks() {
    console.log('Loading books...');

    this.isLoading = true;

    this.changeDetector.detectChanges();

    try {
      const booksCollection = collection(db, 'books');

      const snapshot = await getDocs(booksCollection);

      this.books = snapshot.docs.map((document) => {
        const data = document.data();

        return {
          id: document.id,

          title: data['title'] || '',

          author: data['author'] || '',

          category: data['category'] || '',

          year: Number(data['year']) || 0,

          rating: Number(data['rating']) || 5,

          status: data['status'] || 'Want to Read',

          notes: data['notes'] || '',
        };
      });

      console.log('Books loaded:', this.books);

      this.applyFilters();
    } catch (error) {
      console.error('Error loading books:', error);

      await this.showToast('Failed to load books.', 'danger');
    } finally {
      this.isLoading = false;

      this.changeDetector.detectChanges();
    }
  }

  // =========================
  // REFRESH BOOKS
  // =========================

  async refreshBooks(event: any) {
    console.log('Refreshing books...');

    try {
      const booksCollection = collection(db, 'books');

      const snapshot = await getDocs(booksCollection);

      this.books = snapshot.docs.map((document) => {
        const data = document.data();

        return {
          id: document.id,

          title: data['title'] || '',

          author: data['author'] || '',

          category: data['category'] || '',

          year: Number(data['year']) || 0,

          rating: Number(data['rating']) || 5,

          status: data['status'] || 'Want to Read',

          notes: data['notes'] || '',
        };
      });

      this.applyFilters();
    } catch (error) {
      console.error('Refresh error:', error);

      await this.showToast('Failed to refresh books.', 'danger');
    } finally {
      event.target.complete();

      this.changeDetector.detectChanges();
    }
  }

  // =========================
  // SEARCH BOOKS
  // =========================

  searchBooks(event: any) {
    this.searchTerm = event.detail.value || '';

    this.applyFilters();
  }

  // =========================
  // FILTER BY STATUS
  // =========================

  filterByStatus(event: any) {
    this.selectedStatus = event.detail.value || 'ALL';

    this.applyFilters();
  }

  // =========================
  // APPLY FILTERS
  // =========================

  applyFilters() {
    let result = [...this.books];

    // =========================
    // STATUS FILTER
    // =========================

    if (this.selectedStatus !== 'ALL') {
      result = result.filter((book) => book.status === this.selectedStatus);
    }

    // =========================
    // SEARCH FILTER
    // =========================

    const search = this.searchTerm.trim().toLowerCase();

    if (search) {
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(search) ||
          book.author.toLowerCase().includes(search) ||
          book.category.toLowerCase().includes(search) ||
          book.year.toString().includes(search) ||
          book.status.toLowerCase().includes(search) ||
          book.notes.toLowerCase().includes(search),
      );
    }

    this.filteredBooks = result;

    this.changeDetector.detectChanges();
  }

  // =========================
  // OPEN EDIT MODAL
  // =========================

  openEditModal(book: Book) {
    this.editingBook = {
      ...book,
    };

    this.isEditModalOpen = true;

    this.closeSwipe();

    this.changeDetector.detectChanges();
  }

  // =========================
  // CLOSE EDIT MODAL
  // =========================

  closeEditModal() {
    this.isEditModalOpen = false;

    this.changeDetector.detectChanges();
  }

  // =========================
  // SAVE BOOK
  // =========================

  async saveBook() {
    if (!this.editingBook.id) {
      await this.showToast('Book ID is missing.', 'danger');

      return;
    }

    // =========================
    // VALIDATION
    // =========================

    if (
      !this.editingBook.title.trim() ||
      !this.editingBook.author.trim() ||
      !this.editingBook.category.trim() ||
      !this.editingBook.year
    ) {
      await this.showToast('Please fill in all required fields.', 'warning');

      return;
    }

    const year = Number(this.editingBook.year);

    const rating = Number(this.editingBook.rating);

    if (isNaN(year) || year < 1000 || year > 2100) {
      await this.showToast('Please enter a valid publication year.', 'warning');

      return;
    }

    if (isNaN(rating) || rating < 1 || rating > 10) {
      await this.showToast('Rating must be between 1 and 10.', 'warning');

      return;
    }

    // =========================
    // START LOADING
    // =========================

    this.isLoading = true;

    this.changeDetector.detectChanges();

    try {
      const bookReference = doc(db, 'books', this.editingBook.id);

      await updateDoc(bookReference, {
        title: this.editingBook.title.trim(),

        author: this.editingBook.author.trim(),

        category: this.editingBook.category.trim(),

        year: year,

        rating: rating,

        status: this.editingBook.status,

        notes: this.editingBook.notes.trim(),
      });

      console.log('Book updated:', this.editingBook.id);

      // =========================
      // CLOSE MODAL
      // =========================

      this.closeEditModal();

      // =========================
      // RELOAD BOOKS
      // =========================

      await this.loadBooks();

      await this.showToast('Book updated successfully!', 'success');
    } catch (error) {
      console.error('Update error:', error);

      await this.showToast('Failed to update book.', 'danger');
    } finally {
      this.isLoading = false;

      this.changeDetector.detectChanges();
    }
  }

  // =========================
  // DELETE BOOK
  // =========================

  async deleteBook(book: Book) {
    if (!book.id) {
      await this.showToast('Book ID is missing.', 'danger');

      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    this.isLoading = true;

    this.changeDetector.detectChanges();

    try {
      const bookReference = doc(db, 'books', book.id);

      await deleteDoc(bookReference);

      console.log('Book deleted:', book.id);

      // =========================
      // REMOVE FROM LOCAL ARRAY
      // =========================

      this.books = this.books.filter((item) => item.id !== book.id);

      this.applyFilters();

      this.closeSwipe();

      await this.showToast('Book deleted successfully!', 'success');
    } catch (error) {
      console.error('Delete error:', error);

      await this.showToast('Failed to delete book.', 'danger');
    } finally {
      this.isLoading = false;

      this.changeDetector.detectChanges();
    }
  }

  // =========================
  // START SWIPE
  // =========================

  startSwipe(event: PointerEvent, book: Book) {
    this.swipeStartX = event.clientX;

    this.swipeCurrentX = event.clientX;

    this.isSwiping = true;

    if (this.swipedBookId && this.swipedBookId !== book.id) {
      this.closeSwipe();
    }
  }

  // =========================
  // MOVE SWIPE
  // =========================

  moveSwipe(event: PointerEvent, book: Book) {
    if (!this.isSwiping) {
      return;
    }

    this.swipeCurrentX = event.clientX;

    const difference = this.swipeStartX - this.swipeCurrentX;

    if (difference > 50) {
      this.swipedBookId = book.id;
    } else if (difference < -50) {
      this.swipedBookId = undefined;
    }
  }

  // =========================
  // END SWIPE
  // =========================

  endSwipe(event: PointerEvent, book: Book) {
    this.isSwiping = false;

    const difference = this.swipeStartX - this.swipeCurrentX;

    if (difference > 80) {
      this.swipedBookId = book.id;
    } else if (difference < -50) {
      this.swipedBookId = undefined;
    }

    this.changeDetector.detectChanges();
  }

  // =========================
  // CLOSE SWIPE
  // =========================

  closeSwipe() {
    this.swipedBookId = undefined;

    this.isSwiping = false;

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
