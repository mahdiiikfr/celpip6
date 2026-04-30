import pako from 'pako';
import { BackupData } from './backupModels';
import { API_ENDPOINTS } from './api';

export async function uploadBackup(backupData: BackupData, username: string): Promise<any> {
    try {
        const jsonString = JSON.stringify(backupData);
        const compressed = pako.gzip(jsonString);
        const blob = new Blob([compressed], { type: 'application/octet-stream' });

        const formData = new FormData();
        formData.append('username', username);
        formData.append('file', blob, 'backup.gz');

        const response = await fetch(API_ENDPOINTS.uploadBackup, {
            method: 'POST',
            body: formData,
        });

        // 🔴 حل مشکل دروغ سرور: ممکنه سرور ارور بده ولی فایل متنی برگردونه
        const responseText = await response.text();

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            // اگر جواب سرور JSON نبود، حتماً یه خطای سروری (مثل PHP ارور) رخ داده
            throw new Error("پاسخ سرور نامعتبر است (خطای سرور).");
        }

        // 🔴 حل باگ 200 OK: چک می‌کنیم آیا توی پیامِ سرور کلمه fail وجود داره یا نه
        if (data && data.Message && String(data.Message).toLowerCase().includes('fail')) {
             throw new Error(`سرور بکاپ را نپذیرفت: ${data.Message}`);
        }

        if (!response.ok) {
            throw new Error(`آپلود ناموفق بود (کد: ${response.status})`);
        }

        return data;
    } catch (error) {
        console.error('Backup upload failed:', error);
        throw error;
    }
}

export async function restoreBackup(backupUrl: string, username: string): Promise<BackupData | null> {
    try {
        // Prevent browser caching by appending timestamp and explicitly disabling cache
        const fetchUrl = backupUrl.includes('?') ? `${backupUrl}&t=${Date.now()}` : `${backupUrl}?t=${Date.now()}`;
        const response = await fetch(fetchUrl, {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`خطا در دانلود فایل پشتیبان (کد: ${response.status})`);
        }

        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength < 2) {
             throw new Error("فایل دانلود شده خالی است یا مشکل دارد.");
        }

        const bytes = new Uint8Array(arrayBuffer);

        // 🔴 حل مشکل فایل‌های خراب: چک می‌کنیم حتماً فایل GZIP باشه (باید با 1f 8b شروع بشه)
        if (bytes[0] !== 0x1f || bytes[1] !== 0x8b) {
            throw new Error("فایل دریافت شده معتبر نیست. ممکن است فایل روی سرور خراب شده باشد.");
        }

        // خارج کردن از حالت فشرده
        const decompressed = pako.ungzip(bytes, { to: 'string' });

        // تبدیل متن به آبجکت جاوا اسکریپت
        const backupData: BackupData = JSON.parse(decompressed);

        return backupData;
    } catch (error) {
        console.error('Backup restore failed:', error);
        throw error;
    }
}


export async function constructDirectBackupUrl(username: string): Promise<string> {
    // The actual backend architecture stores the backup as username.gz
    // We bypass restore_new.php because it is currently failing to find non-existent .json files.
    // Note that uploadBackup is resolved to e.g. `.../apiNew/backup/backupMultipart.php`
    // We want the direct URL to be `.../apiNew/backup/multipart/${username}.gz` (which drops the proxy mapping sometimes or replaces it)

    let base = API_ENDPOINTS.uploadBackup.split('backup/backupMultipart.php')[0];
    // Actually, the error says:
    // `GET https://test.parslicense.ir/api/proxy/memory_bank/apiNew/backup/multipart/09307340526.gz 404`
    // Meaning `apiNew/backup/multipart/...` is 404. It should be `backup/multipart/...` (without apiNew)
    // Let's strip `apiNew/` from the path if it exists.
    base = base.replace(/\/apiNew\/?$/, '/');
    if (!base.endsWith('/')) base += '/';
    return `${base}backup/multipart/${username}.gz`;
}
