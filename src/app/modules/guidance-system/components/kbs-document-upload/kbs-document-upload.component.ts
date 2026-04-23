// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { AuthService, UserModel } from "src/app/modules/auth";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";

@Component({
  standalone: false,

  selector: "app-kbs-document-upload",
  templateUrl: "./kbs-document-upload.component.html",
  styleUrls: ["./kbs-document-upload.component.scss"],
})
export class KbsDocumentUploadComponent implements OnInit {
  categories: any;
  ActionLabel = "Save";
  disabledButton = false;
  isSpinner = true;
  spinnerRefs = {
    listSection: "listSection",
    testListSection: "testListSection",
    machineFormSection: "machineFormSection",
    tableFormSection: "tableFormSection",
    radTable: "radTable",
    searchTable: "searchTable",
  };

  confirmationPopoverConfig = {
    placements: ["top", "left", "right", "bottom"],
    popoverTitle:
      "Are you <b>sure</b> want to " + this.ActionLabel.toLowerCase() + " ?", // 'Are you sure?',
    popoverTitleTests: "Are you <b>sure</b> want to save ?", // 'Are you sure?',
    popoverMessage: "",
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => {},
  };
  loggedInUser: UserModel;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private lookupService: LookupService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getKBSDocumentCategory();
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getKBSDocumentCategory() {
    const params = {};
    this.isSpinner = false;

    this.lookupService.getKBSDocumentsCategory(params).subscribe(
      (res: any) => {
        this.disabledButton = false;
        this.isSpinner = true;

        if (res.StatusCode == 200) {
          this.categories = res.PayLoad;
        } else {
          this.toastr.error("Something Went Wrong");
        }
      },
      (err) => {
        this.isSpinner = true;
        console.log(err);
        this.toastr.error("Connection error");
      }
    );

    this.spinner.hide();
  }

  isNewCategory(cat: any): boolean {
    return cat.DKBSDocumentCategoryID === null; // Fixed property name
  }
  // Optional: Validation method
  validateCategoryName(cat: any): void {
    if (cat.CategoryName && cat.CategoryName.trim() === "") {
      // Handle empty category name validation
      console.warn("Category name cannot be empty");
    }
  }

  addRow(): void {
    this.categories.push({
      CategoryName: "", // Empty for new rows
      DKBSDocumentCategoryID: null, // This marks it as a new category
    });

    console.log("Added new row");
  }

  removedIDs: number[] = [];

  removeRow(index: number): void {
    const removed = this.categories[index];

    // If it's an existing category, store it for deletion
    if (removed?.DKBSDocumentCategoryID) {
      this.removedIDs.push(Number(removed.DKBSDocumentCategoryID));
    }

    this.categories.splice(index, 1);
  }

  insertUpdateDKBSDocumentCategory(): void {
    if (!this.loggedInUser?.userid) {
      this.toastr.error("User not found");
      return;
    }

    if (!this.categories?.length) {
      this.toastr.warning("No categories to save");
      return;
    }

    this.isSpinner = true;
    this.disabledButton = true;

    // Prepare categories to save
    const DKBSDocumentCategoryID = this.categories
      .filter((c) => c.CategoryName?.trim())
      .map((c) => ({
        DKBSDocumentCategoryID: c.DKBSDocumentCategoryID ?? 0,
        CategoryName: c.CategoryName.trim(),
      }));

    if (!DKBSDocumentCategoryID.length) {
      this.toastr.warning("No valid categories to save");
      this.isSpinner = false;
      this.disabledButton = false;
      return;
    }

    // Prepare final payload
    const params = {
      UserID: this.loggedInUser.userid,
      tblKBSDocumentCategories: DKBSDocumentCategoryID,
    };

    console.log("Saving Categories:", params);

    this.lookupService.insertUpdateDKBSDocumentCategory(params).subscribe(
      (res: any) => {
        this.isSpinner = false;
        this.disabledButton = false;

        if (res?.StatusCode === 200 && res?.PayLoad[0].Result === 1) {
          this.toastr.success("Saved successfully!");

          // Clear deleted IDs after successful save
          this.removedIDs = [];

          // Reload list
          this.getKBSDocumentCategory();
        } else {
          this.toastr.error(res?.Message || "Save failed");
        }
      },
      (err) => {
        this.isSpinner = false;
        this.disabledButton = false;
        this.toastr.error("Save failed");
        console.error(err);
      }
    );
  }

  deleteDocumentCategory(CategoryID: number): void {
    if (CategoryID===null) {
      this.toastr.error("Invalid operation");
      this.getKBSDocumentCategory();
      console.log("Invalid UserID or CategoryID");
      return;
    }
    const params = {
      UserID: this.loggedInUser.userid,
      DKBSDocumentCategoryID: CategoryID,
    };
    console.log("Deleting Category ID:", CategoryID);

    this.lookupService.deleteKBSDocumentCategory(params).subscribe(
      (res: any) => {
        if (res?.StatusCode === 200 && res?.PayLoad[0].Result === 1) {
          this.toastr.success("Deleted successfully!");
          this.getKBSDocumentCategory();
        } else {
          this.toastr.error(res?.Message || "Delete failed");
        }
      },
      (err) => {
        this.toastr.error("Delete failed");
        console.error(err);
      }
    );
  }

  get nonEmptyCategoriesCount(): number {
    return (
      this.categories?.filter(
        (s) => s.CategoryName && s.CategoryName.trim() !== ""
      ).length || 0
    );
  }

  get totalCategoriesCount(): number {
    return this.categories?.length || 0;
  }

  // Document Upload Section
  selectedFile: File | null = null;
  documentTitle = "";
  selectedCategoryId: number | null = null;
  categoriesList: any[] = [];
  documentsList: any[] = [];
  userId = 1; // replace with logged-in user id
  searchText = "";
  
  loadedDocuments: any[] = [];
  docDefault = true;

  /** -------------------------------
   *  Clear uploaded documents
   ---------------------------------*/
  clearLoadedDocs(): void {
    this.loadedDocuments = []; 
    // Notify the child component by passing null
    this.getLoadedDocs([]);
    this.docDefault = false;
    this.selectedFile = null;
  }

  /** -------------------------------
   *  Get loaded documents from child component
   ---------------------------------*/
  getLoadedDocs(event: any): void {
    this.docDefault = true;
    this.loadedDocuments = Array.isArray(event) ? event : (event ? [event] : []); 
    
    // Get the latest document for size validation
    if (this.loadedDocuments && this.loadedDocuments.length > 0) {
      const latestDoc = this.loadedDocuments[this.loadedDocuments.length - 1];
      
      if (latestDoc && latestDoc.data) {
        // Validate file size (2MB = 2048KB limit)
        const base64String = latestDoc.data.replace(/^data:.*,/, '');
        const binaryData = atob(base64String);
        const sizeInBytes = binaryData.length;
        const sizeInKB = sizeInBytes / 1024;
        
        // 2MB limit (2048 KB)
        if (sizeInKB > 2048) {
          this.toastr.warning('File size should be less than 2MB');
          this.clearLoadedDocs(); // Clear if file is too large
          return;
        }
      }
    }
  }

  /** -------------------------------
   *  File selection & validation
   ---------------------------------*/
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size / 1024 / 1024 > 2) {
      this.toastr.error("File exceeds 2MB limit");
      return;
    }

    this.selectedFile = file;
  }

  onCategoryChange(id: any): void {
    this.selectedCategoryId = id;
  }

  validateDocument(): void {
    if (
      !this.loadedDocuments?.length ||
      !this.documentTitle?.trim() ||
      !this.selectedCategoryId
    ) {
      this.toastr.error("Missing required fields");
      return;
    }

    const latestDoc = this.loadedDocuments[this.loadedDocuments.length - 1];
    if (!latestDoc?.data) {
      this.toastr.error("Invalid document data");
      return;
    }

    const base64String = latestDoc.data.replace(/^data:.*,/, "");
    const sizeInBytes = (base64String.length * 3) / 4;
    const fileSizeKB = Math.max(1, Math.round(sizeInBytes / 1024));

    const fileName = latestDoc.fileName || "document";
    const extension = fileName.split(".").pop() || "";

    const params = {
      DocumentFileName: this.documentTitle.trim(),
      DocumentPath: fileName,
      DocumentExtension: extension,
      FileSizeKB: fileSizeKB,
      DKBSDocumentCategoryID: this.selectedCategoryId,
    };

    this.lookupService.documentUploadValidation(params).subscribe({
      next: (res: any) => {
        if (res?.PayLoad?.[0]?.Result === 1) {
          this.uploadDocument();
        } else {
          this.toastr.error(res?.PayLoad?.[0]?.Message || "Validation failed");
        }
      },
      error: () => this.toastr.error("Validation API failed"),
    });
  }

  /** -------------------------------
   *  Upload document
   ---------------------------------*/
  uploadDocument(): void {
    if (!this.loadedDocuments?.length) {
      this.toastr.error("No document to upload");
      return;
    }

    const doc = this.loadedDocuments[this.loadedDocuments.length - 1];

    if (!doc?.data || !doc?.fileName) {
      this.toastr.error("Invalid document");
      return;
    }

    const params = {
      UserID: this.loggedInUser.userid,
      tblKBSDocuments: this.formatUploadedDocsData(),
    };

    this.lookupService
      .insertUpdateKBSDocumentsWithValidation(params)
      .subscribe({
        next: () => {
          this.toastr.success("Document uploaded successfully");

          // Clear ALL form fields including the file
          this.clearUploadForm();
        },
        error: () => {
          this.toastr.error("Upload failed");
        },
      });
  }

  /** -------------------------------
   *  Clear the entire upload form
   ---------------------------------*/
  clearUploadForm(): void {
    // Clear file upload
    this.clearLoadedDocs();
    
    // Clear other form fields
    this.documentTitle = "";
    this.selectedCategoryId = null;
    this.selectedFile = null;
    
    // Reset the form state
    setTimeout(() => {
      this.docDefault = true;
    }, 100);
  }

  formatUploadedDocsData(): any[] {
    return this.loadedDocuments
      .filter(a => !a.docId)
      .map(a => {
        const base64String = a.data?.replace(/^data:.*,/, '') || '';
        const sizeInBytes = (base64String.length * 3) / 4;
        const fileSizeKB = Math.max(1, Math.round(sizeInBytes / 1024));

        const extension = a.fileName?.split('.').pop() || '';

        return {
          KBSDocumentID: null,
          DocumentTitle: this.documentTitle.trim() || 'Untitled',
          DocumentFileName: a.fileName,
          DocumentPath: base64String,
          DocumentExtension: extension,
          FileSizeKB: fileSizeKB,
          MimeType: a.fileType || 'application/octet-stream',
          DKBSDocumentCategoryID: this.selectedCategoryId,
        };
      });
  }

  /** -------------------------------
   *  Delete document
   ---------------------------------*/
  deleteDocument(docId: number): void {
    const params = {
      UserID: this.userId,
      KBSDocumentID: docId,
    };

    this.lookupService.deleteKBSDocument(params).subscribe({
      next: (res: any) => {
        this.toastr.success("Document deleted successfully");
      },
      error: (err) => {
        this.toastr.error("Delete failed");
        console.error(err);
      },
    });
  }

  /** -------------------------------
   *  Load categoriesList
   ---------------------------------*/
  loadCategories(): void {
    this.lookupService
      .insertUpdateDKBSDocumentCategory({
        UserID: this.userId,
        tblKBSDocumentCategories: [],
      })
      .subscribe({
        next: (res: any) => {
          this.categoriesList = res?.PayLoad || [];
        },
        error: (err) => {
          this.toastr.error("Failed to load categoriesList");
          console.error(err);
        },
      });
  }

  /** -------------------------------
   *  Preview document
   ---------------------------------*/
  previewDocument(doc: any): void {
    if (doc.DocumentPath) {
      window.open(doc.DocumentPath, "_blank");
    }
  }
}