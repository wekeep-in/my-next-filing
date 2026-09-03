# Tax Year 2026-27 Rule review

Reviewed: 3 September 2026

Dataset: `my-next-filing-2026-27-v3`, schema version 1, effective 1 April 2026 to 31 March 2027, review expiry 31 August 2027.

## Checked authority

- Income-tax Act, 2025 as amended by Finance Act, 2026: sections 58, 62, 156, 202, 263, 404, and 408. [Direct Act PDF](https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf)
- Income Tax Department section 58: the 6%/8% eligible-business path, 50% specified-profession path, 2 crore/3 crore and 50 lakh/75 lakh receipt limits, cash test, and five-year exclusion. [Section 58](https://www.incometaxindia.gov.in/w/section-58-138)
- Income Tax Department section 62: specified professions, including technical consultancy and information technology. [Section 62](https://www.incometaxindia.gov.in/w/section-62-134)
- Income Tax Department Budget 2026 FAQ: Tax Year 2026-27 new-regime slabs, ₹60,000 rebate, marginal relief examples, and 31 August non-audit business/profession return date. [Budget 2026 FAQ](https://www.incometaxindia.gov.in/documents/20117/15766092/FAQs-Budget-2026.pdf/ff3d0e10-88a0-b11f-3c27-b58375974227)
- Income Tax Department section 408: presumptive taxpayers pay the whole advance-tax amount by 15 March. [Section 408](https://www.incometaxindia.gov.in/w/section-408-6)
- CBIC and India Code: ₹10 lakh/₹20 lakh service registration thresholds and the thirty-day registration window. [CGST Act](https://upload.indiacode.nic.in/showfile?actid=AC_CEN_2_2_00042_201712_1517807328102&filename=a2017-12.pdf&type=actfile), [CBIC registration rules](https://cbic-gst.gov.in/gst-registration-rules.html)
- Reserve Bank of India: 1 October 2026 foreign-exchange export-regulation transition used only as reviewed guidance. [FEMA notifications](https://www.rbi.org.in/scripts/BS_FemaNotifications.aspx?Id=13277)

## Result

No S0, S1, or S2 findings were identified in the frozen first-release values or calculation boundaries. The expected ₹55,160 example was independently recomputed from ₹14,00,000 presumptive income, ₹10,000 interest, ₹40,000 Indian TDS, the Tax Year 2026-27 slabs, ₹60,000 rebate boundary, and 4% cess. Boundary checks cover both presumptive paths, cash at exactly 5%, receipt ceilings, ₹10,000 advance tax, return triggers, GST threshold equality, and the 30-day registration window.

The qualified privacy review remains a release dependency and is not a statutory Rule approval. The later GST-return calendar remains absent until its separate compliance review.
