/**
 * 💡 ZATCA QR Code Generator (Saudi E-Invoicing Phase 1)
 * تحويل بيانات الفاتورة إلى صيغة TLV ثم Base64 ليتوافق مع تطبيق "زكاتي"
 */

export function generateZatcaQr(sellerName, vatNumber, timestamp, totalAmount, vatAmount) {
    // دالة مساعدة لتحويل القيم إلى تنسيق TLV (الوسم - الطول - القيمة)
    const encodeTlv = (tag, value) => {
        const encoder = new TextEncoder();
        const valueBuffer = encoder.encode(value);
        const tagBuffer = new Uint8Array([tag]);
        const lengthBuffer = new Uint8Array([valueBuffer.length]);
        
        const tlv = new Uint8Array(tagBuffer.length + lengthBuffer.length + valueBuffer.length);
        tlv.set(tagBuffer, 0);
        tlv.set(lengthBuffer, tagBuffer.length);
        tlv.set(valueBuffer, tagBuffer.length + lengthBuffer.length);
        
        return tlv;
    };

    // 1. اسم المورد
    const tag1 = encodeTlv(1, sellerName);
    // 2. الرقم الضريبي (يجب أن يكون 15 رقم)
    const tag2 = encodeTlv(2, vatNumber);
    // 3. الطابع الزمني (ISO 8601)
    const tag3 = encodeTlv(3, timestamp);
    // 4. إجمالي الفاتورة (مع الضريبة)
    const tag4 = encodeTlv(4, totalAmount);
    // 5. مبلغ الضريبة
    const tag5 = encodeTlv(5, vatAmount);

    // تجميع كل الأوسمة في مصفوفة واحدة
    const combinedLength = tag1.length + tag2.length + tag3.length + tag4.length + tag5.length;
    const combinedTlv = new Uint8Array(combinedLength);
    
    let offset = 0;
    [tag1, tag2, tag3, tag4, tag5].forEach(tag => {
        combinedTlv.set(tag, offset);
        offset += tag.length;
    });

    // تحويل المصفوفة النهائية إلى Base64
    return btoa(String.fromCharCode(...combinedTlv));
}