"use client"

import DOMPurify from "dompurify";

export default function ProductDescription({
    text,

}: {
    text: [string, string];

}) {
    const sanitizedDescription1 = DOMPurify.sanitize(text[0]);
    const sanitizedDescription2 = DOMPurify.sanitize(text[1]);
    return (
        <div className="pt-6">
            {/* Title */}
            <div className="b-12">
                <h2 className="text-main-primary text-2x1 font-bold">Description</h2>
            </div>
        {/* Display both description */}
        <div dangerouslySetInnerHTML={{ __html: sanitizedDescription1}} />
        <div dangerouslySetInnerHTML={{ __html: sanitizedDescription2}} />
      </div>
    );
};
