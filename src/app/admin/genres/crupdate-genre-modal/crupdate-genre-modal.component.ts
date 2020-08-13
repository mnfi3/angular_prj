import {Component, Inject, Optional} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Genres} from '../../../web-player/genres/genres.service';
import {Genre} from '../../../models/Genre';
import {ImageUploadValidator} from '../../../web-player/image-upload-validator';
import {UploadQueueService} from '@common/uploads/upload-queue/upload-queue.service';
import {Settings} from '@common/core/config/settings.service';
import {openUploadWindow} from '@common/uploads/utils/open-upload-window';
import {UploadInputTypes} from '@common/uploads/upload-input-config';
import {BackendErrorResponse} from '@common/core/types/backend-error-response';

interface CrupdateGenreModalData {
    genre?: Genre;
}

@Component({
    selector: 'crupdate-genre-modal',
    templateUrl: './crupdate-genre-modal.component.html',
    styleUrls: ['./crupdate-genre-modal.component.scss'],
    providers: [UploadQueueService],
})
export class CrupdateGenreModalComponent {
    public errors: any = {};
    public updating = false;
    public loading = false;
    public genre = new Genre();

    constructor(
        public settings: Settings,
        protected genres: Genres,
        protected uploadQueue: UploadQueueService,
        private dialogRef: MatDialogRef<CrupdateGenreModalComponent>,
        private imageValidator: ImageUploadValidator,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: CrupdateGenreModalData,
    ) {
        if (this.data.genre) {
            this.genre = this.data.genre;
            this.updating = true;
        }
    }

    public confirm() {
        let request;

        if (this.updating) {
            request = this.genres.update(this.genre.id, this.getPayload());
        } else {
            request = this.genres.create(this.getPayload());
        }

        request.subscribe(response => {
            this.loading = false;
            this.dialogRef.close(response.genre);
        }, (errResponse: BackendErrorResponse) => {
            this.loading = false;
            this.errors = errResponse.errors;
        });
    }

    public close(genre?: Genre) {
        this.dialogRef.close(genre);
    }

    public openUploadImageModal() {
        const params = {uri: 'uploads/images', httpParams: {diskPrefix: 'genre_media'}, validator: this.imageValidator};
        openUploadWindow({types: [UploadInputTypes.image]}).then(uploadedFiles => {
            if ( ! uploadedFiles) return;
            this.uploadQueue.start(uploadedFiles, params).subscribe(response => {
                this.genre.image = response.fileEntry.url;
            });
        });
    }

    private getPayload() {
        return {
            name: this.genre.name,
            display_name: this.genre.display_name,
            image: this.genre.image,
        };
    }
}
