import { google } from 'googleapis';
import { Injectable, Logger } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

interface IFile {
    name?: string,
    id?: string
}

@Injectable()
export class GdriveService {
    private readonly authParams = {
        keyFile: 'keys.json', // the key file
        scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
    };
    private authClient: OAuth2Client;
    private readonly logger = new Logger(GdriveService.name);

    constructor() {
        this.initializeAuthClient();
    }

    private async initializeAuthClient() {
        const auth = new google.auth.GoogleAuth({
            keyFile: this.authParams.keyFile,
            scopes: this.authParams.scopes,
        });
        this.authClient = await auth.getClient() as OAuth2Client;
    }

    async moveFileToFolder({ fileId, folderId }: { fileId: string, folderId: string }) {
        const auth = this.authClient;
        google.options({ auth });
        const drive = google.drive({ version: 'v3' });
        await drive.files.update({
            fileId,
            addParents: folderId,
            removeParents: 'root',
            fields: 'id, parents',
        });
        this.logger.log(`Moved file ${fileId} to folder ${folderId}`);
    }

    async clearFolder({ folderId }: { folderId: string }): Promise<void> {
        try {
            const auth = this.authClient;
            google.options({ auth });

            const drive = google.drive({ version: 'v3' });
            const response = await drive.files.list({
                q: `'${folderId}' in parents`,
                fields: 'files(id, name)',
            });

            const files = await this.getFilesList({ folderId })
            if (files && files.length) {
                this.logger.log(`Found ${files.length} files in folder with ID: ${folderId}`);
                for (const file of files) {
                    await drive.files.delete({
                        fileId: file.id,
                    });
                    this.logger.log(`Deleted file: ${file.name} (ID: ${file.id}) from folder ${folderId}`);
                }

                this.logger.log(`All files in folder with ID: ${folderId} have been deleted`);
            } else {
                this.logger.log(`No files found in folder with ID: ${folderId}`);
            }
        } catch (err) {
            this.logger.error('Error deleting files in folder:', err);
            throw err;
        }
    }

    async getFilesList({ folderId }: { folderId: string }): Promise<IFile[]> {
        try {
            const auth = this.authClient;
            google.options({ auth });
            const drive = google.drive({ version: 'v3' });

            const response = await drive.files.list({
                q: `'${folderId}' in parents`,
                fields: 'files(id, name)',
            });

            return response.data.files;

        } catch (err) {
            this.logger.error('Error create files  in folder list:', err);
            throw err;
        }
    }
}
