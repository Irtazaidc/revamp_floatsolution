// @ts-nocheck
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { AuthService, UserModel } from "src/app/modules/auth";
import { LookupService } from "../../services/lookup.service";
import { TestProfileService } from "../../services/test-profile.service";
import { FormsModule } from "@angular/forms";

@Component({
  standalone: false,

  selector: "app-free-test-approvals",
  templateUrl: "./free-test-approvals.component.html",
  styleUrls: ["./free-test-approvals.component.scss"],
})
export class FreeTestApprovalsComponent implements OnInit {
  loggedInUser: UserModel;
  pendingList: any[] = [];
  pendingItemList: any[] = [];
  ActionLabel = "Submit";
  disabledButton = false;
  requestRemarks = "";
  confirmationPopoverConfig = {
    placements: ["top", "left", "right", "bottom"],
    popoverTitle:
      "Are you <b>sure</b> want to " + this.ActionLabel.toLowerCase() + " ?", // 'Are you sure?',
    popoverTitleTests: "Are you <b>sure</b> want to submit ?", // 'Are you sure?',
    popoverMessage: "",
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => {},
  };

  constructor(
    private fb: FormBuilder,
    private testProfileService: TestProfileService,
    private lookupService: LookupService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
    this.getMyPendingApprovals(this.loggedInUser?.userid);
  }

  getMyPendingApprovals(userId: number) {
    const objParam = {
      ActingUserId: userId,
    };

    this.lookupService.getMyPendingApprovals(objParam).subscribe(
      (res: any) => {
        if (res && res.StatusCode === 200) {
          this.pendingList = res.PayLoadDS["Table"] || [];
        } else {
          this.pendingList = [];
        }
      },
      (err) => {
        console.log(err);
        this.pendingList = [];
      },
    );
  }
  getMyPendingApprovalsItems(
    userId: number,
    requestId: number,
    requestNo: string,
  ) {
    const objParam = {
      ActingUserId: userId,
      RequestId: requestId,
      RequestNo: requestNo,
    };

    this.lookupService.getMyPendingApprovalsItems(objParam).subscribe(
      (res: any) => {
        if (res && res.StatusCode === 200) {
          this.pendingItemList = (res.PayLoadDS?.["Table"] || []).map(
            (x: any) => ({
              ...x,
              IsSelected: false,
              Remarks: "",
            }),
          );
        } else {
          this.pendingItemList = [];
        }
      },
      (err) => {
        console.log(err);
        this.pendingItemList = [];
      },
    );
  }

  selectedRequest: any = null;
  onSelectRequest(item: any) {
    this.selectedRequest = item;
    this.pendingItemList = [];

    this.getMyPendingApprovalsItems(
      this.loggedInUser?.userid,
      item?.RequestId,
      item?.RequestNo,
    );
  }

  submitRequest() {
    if (!this.selectedRequest) {
      this.toastr.warning("Please select a request");
      return;
    }
    // ✅ Mandatory Request Remarks validation
    if (!this.requestRemarks || !this.requestRemarks.trim()) {
      this.toastr.warning("Request Remarks are required.");
      return;
    }

    // ===============================
    // Prepare Actions Table
    // ===============================
    const Actions = this.pendingItemList.map((it: any) => ({
      RequestItemId: it.RequestItemId,
      IsApprove: it.IsSelected ? 1 : 0,
      Remarks: it.Remarks,
    }));

    // ===============================
    // Prepare Params
    // ===============================
    const params = {
      ActingUserId: this.loggedInUser?.userid,
      RequestId: this.selectedRequest?.RequestId,
      RequestNo: this.selectedRequest?.RequestNo,
      ActionRemarks: this.requestRemarks || null,
      Actions,
    };

    console.log("Final Insert Params:", params);

    this.spinner.show();

    this.lookupService.InsertUpdateMyApprovals(params).subscribe(
      (res: any) => {
        this.spinner.hide();

        if (res && res.StatusCode === 200) {
          this.toastr.success("Request submitted successfully");

          this.getMyPendingApprovals(this.loggedInUser?.userid);

          this.pendingItemList = [];
          this.requestRemarks = "";
          this.selectedRequest = null;
        } else {
          this.toastr.error(res.ErrorDetails);
        }
      },
      (err) => {
        this.spinner.hide();
        console.log(err);
        this.toastr.error(err.ErrorDetails);
      },
    );
  }

  isAllSelected(): boolean {
    if (!this.pendingItemList?.length) return false;
    return this.pendingItemList.every((x) => x.IsSelected);
  }

  isIndeterminate(): boolean {
    if (!this.pendingItemList?.length) return false;

    const selected = this.pendingItemList.filter((x) => x.IsSelected).length;

    return selected > 0 && selected < this.pendingItemList.length;
  }

  toggleSelectAll(event: any) {
    const checked = event.target.checked;

    this.pendingItemList.forEach((x) => {
      x.IsSelected = checked;
    });
  }

attachmentsList: any[] = [];
selectedPreview: any = null;

openAttachmentsModal(content: any): void {
  const rawAttachments = this.selectedRequest?.Attachments;

  if (!rawAttachments || !rawAttachments.trim()) {
    this.attachmentsList = [];
  } else {
    try {
      const parsed = JSON.parse(rawAttachments);

      this.attachmentsList = Array.isArray(parsed)
        ? parsed.map((item: any) => ({
            ...item,
            FileExtension: (item.FileExtension || '').toLowerCase(),
            PreviewUrl: this.getBase64ImageSrc(item),
            HasError: false
          }))
        : [];
    } catch (error) {
      console.error('Invalid Attachments JSON:', error);
      this.attachmentsList = [];
    }
  }

  this.modalService.open(content, {
    size: 'xl',
    backdrop: 'static',
    centered: true
  });
}

getBase64ImageSrc(file: any): string {
  if (!file?.FileBase64) {
    return '';
  }

  const ext = (file.FileExtension || '').toLowerCase();

  let mimeType = 'image/png';

  switch (ext) {
    case 'jpg':
    case 'jpeg':
      mimeType = 'image/jpeg';
      break;
    case 'png':
      mimeType = 'image/png';
      break;
    case 'gif':
      mimeType = 'image/gif';
      break;
    case 'bmp':
      mimeType = 'image/bmp';
      break;
    case 'webp':
      mimeType = 'image/webp';
      break;
    case 'svg':
      mimeType = 'image/svg+xml';
      break;
  }

  return `data:${mimeType};base64,${file.FileBase64}`;
}

isImageFile(extension: string): boolean {
  return ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'].includes(
    (extension || '').toLowerCase()
  );
}

openAttachmentInNewTab(file: any): void {
  const imageSrc = this.getBase64ImageSrc(file);

  if (!imageSrc) {
    return;
  }

  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(`
      <html>
        <head>
          <title>${file.FileName || 'Attachment'}</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #111;
              min-height: 100vh;
            }
            img {
              max-width: 100%;
              max-height: 100vh;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <img src="${imageSrc}" alt="${file.FileName || 'Attachment'}" />
        </body>
      </html>
    `);
    newWindow.document.close();
  }
}

onImageError(item: any): void {
  item.HasError = true;
}

trackByAttachment(index: number, item: any): string {
  return item.FilePath || item.FileName || index.toString();
}
}
