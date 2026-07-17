<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Quotation {{ $quotation_no ?? '' }}</title>
    <style>
        @font-face {
            font-family: 'Sarabun';
            font-style: normal;
            font-weight: normal;
            src: url("https://cdn.jsdelivr.net/npm/font-sarabun@1.0.0/fonts/Sarabun-Regular.ttf") format('truetype');
        }
        @font-face {
            font-family: 'Sarabun';
            font-style: normal;
            font-weight: bold;
            src: url("https://cdn.jsdelivr.net/npm/font-sarabun@1.0.0/fonts/Sarabun-Bold.ttf") format('truetype');
        }

        @page {
            size: a4 portrait;
            margin: 15mm 15mm 20mm 15mm;
        }

        body {
            font-family: 'Sarabun', 'Helvetica', 'Arial', sans-serif;
            font-size: 11px;
            color: #000000;
            line-height: 1.3;
            margin: 0;
            padding: 0;
        }

        /* Header Style */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2px;
        }
        .header-left {
            text-align: left;
            vertical-align: top;
            width: 70%;
        }
        .company-name {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
        }
        .company-details {
            font-size: 9.5px;
            color: #333333;
            line-height: 1.2;
        }
        .header-right {
            text-align: right;
            vertical-align: top;
            width: 30%;
        }
        .logo-img {
            height: 55px;
            object-fit: contain;
        }

        /* Divider Line */
        .divider {
            border-top: 2px solid #000000;
            margin-top: 4px;
            margin-bottom: 6px;
        }

        /* Document Title */
        .doc-title {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            letter-spacing: 4px;
            margin-bottom: 12px;
            text-transform: uppercase;
        }

        /* Meta details Grid via Tables */
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
        }
        .meta-table td {
            padding: 1px 0;
            vertical-align: top;
            font-size: 10.5px;
        }
        .label-cell {
            font-weight: bold;
            width: 55px;
        }
        .colon-cell {
            width: 12px;
            text-align: center;
        }
        .value-cell {
            color: #000000;
        }
        .value-cell-bold {
            font-weight: bold;
            color: #000000;
        }

        /* Right Meta Column width matching original */
        .right-meta-table {
            width: 100%;
            border-collapse: collapse;
        }
        .right-meta-table td {
            padding: 1px 0;
            vertical-align: top;
            font-size: 10.5px;
        }
        .right-label-cell {
            font-weight: bold;
            width: 75px;
        }

        /* Table Design */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000000;
            margin-bottom: 8px;
        }
        .items-table th {
            font-size: 9px;
            font-weight: bold;
            text-align: center;
            vertical-align: middle;
            border-bottom: 2px solid #000000;
            border-left: 1px solid #000000;
            border-right: 1px solid #000000;
            padding: 3px 2px;
            background-color: #ffffff;
        }
        .items-table th.sub-th {
            font-size: 8px;
            border-bottom: 2px solid #000000;
            color: #555555;
            font-weight: normal;
        }
        .items-table td {
            font-size: 10px;
            padding: 4px 6px;
            vertical-align: middle;
            border-left: 1px solid #000000;
            border-right: 1px solid #000000;
            height: 24px;
        }
        .row-even {
            background-color: #ffffff;
        }
        .row-odd {
            background-color: #fcfcfc;
        }
        .text-center {
            text-align: center;
        }
        .text-right {
            text-align: right;
        }
        .text-left {
            text-align: left;
        }

        /* Total Value row */
        .total-value-container {
            width: 100%;
            text-align: right;
            margin-bottom: 12px;
        }
        .total-value-label {
            font-size: 10.5px;
            font-weight: bold;
            display: inline-block;
            margin-right: 25px;
            vertical-align: middle;
        }
        .total-value-amount {
            display: inline-block;
            width: 110px;
            font-size: 10.5px;
            font-weight: bold;
            border-top: 1px solid #000000;
            border-bottom: 3px double #000000;
            padding: 3px 2px;
            text-align: right;
            vertical-align: middle;
        }

        /* Terms and Conditions */
        .terms-section {
            font-size: 8.5px;
            color: #333333;
            text-align: left;
            margin-bottom: 15px;
            padding-left: 10px;
            line-height: 1.25;
        }
        .terms-title {
            font-weight: bold;
            color: #000000;
            font-size: 9px;
            margin-bottom: 3px;
        }
        .terms-item {
            margin: 0 0 1px 0;
            padding: 0;
        }

        /* Signatures Block */
        .signature-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .signature-col {
            width: 50%;
            vertical-align: top;
        }
        .signature-title {
            font-size: 10.5px;
            margin-bottom: 45px;
        }
        .signature-title-bold {
            font-size: 10.5px;
            font-weight: bold;
            margin-bottom: 45px;
        }
        .signature-line {
            border-bottom: 1px solid #000000;
            width: 180px;
            margin-bottom: 3px;
        }
        .signature-company {
            font-size: 10px;
            font-weight: bold;
        }
        .signature-stamp-label {
            font-size: 8.5px;
            font-weight: bold;
            text-transform: uppercase;
            color: #444444;
        }

        /* Footer */
        .footer-table {
            position: absolute;
            bottom: -5mm;
            left: 0px;
            width: 100%;
            border-collapse: collapse;
            font-size: 8px;
            color: #555555;
        }
        .footer-left {
            text-align: left;
            width: 33%;
        }
        .footer-center {
            text-align: center;
            width: 33%;
        }
        .footer-right {
            text-align: right;
            width: 33%;
            line-height: 1.2;
        }
    </style>
</head>
<body>

    <!-- Header Table -->
    <table class="header-table">
        <tr>
            <td class="header-left">
                <div class="company-name">IKM TESTING (THAILAND) CO., LTD.</div>
                <div class="company-details">
                    155/167 Moo 5, Samnakthon Sub-district, Banchang District, Rayong Province<br>
                    Thailand 21130<br>
                    Tel : + 66 38 601 996 to 8
                </div>
            </td>
            <td class="header-right">
                <img class="logo-img" src="https://lh3.googleusercontent.com/d/15kgSg9bp-J9mYETYxw2BfAVNNNBAkusA" alt="IKM Logo">
            </td>
        </tr>
    </table>

    <!-- Divider Line -->
    <div class="divider"></div>

    <!-- Document Title -->
    <div class="doc-title">QUOTATION</div>

    <!-- Info Sections in 2 Columns -->
    <table class="header-table" style="margin-bottom: 4px;">
        <tr>
            <td style="width: 58%; vertical-align: top; text-align: left;">
                <table class="meta-table">
                    <tr>
                        <td class="label-cell">To</td>
                        <td class="colon-cell">:</td>
                        <td class="value-cell-bold">{{ $customer_name ?? 'STP&I Company Limited' }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">Attn</td>
                        <td class="colon-cell">:</td>
                        <td class="value-cell">{{ $attention ?? 'Khun Sawit Kong-ngoen' }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">Tel</td>
                        <td class="colon-cell">:</td>
                        <td class="value-cell">{{ $customer_phone ?? '+66(0)93-296-9151' }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">Email</td>
                        <td class="colon-cell">:</td>
                        <td class="value-cell" style="word-break: break-all;">{{ $customer_email ?? 'sawit.k@stpi.co.th' }}</td>
                    </tr>
                </table>
            </td>
            <td style="width: 42%; vertical-align: top; text-align: right;">
                <table class="right-meta-table" style="float: right; width: 220px;">
                    <tr>
                        <td class="right-label-cell">Our Ref.</td>
                        <td class="colon-cell">:</td>
                        <td class="value-cell-bold">
                            {{ $quotation_no ?? 'QT-0001-26' }}{{ isset($revision_number) && $revision_number > 0 ? '-R'.$revision_number : '' }}
                        </td>
                    </tr>
                    <tr>
                        <td class="right-label-cell">Date</td>
                        <td class="colon-cell">:</td>
                        <td class="value-cell">
                            {{ isset($quotation_date) ? date('d M Y', strtotime($quotation_date)) : '16 Jun 2026' }}
                        </td>
                    </tr>
                    <tr>
                        <td class="right-label-cell">No. of Page</td>
                        <td class="colon-cell">:</td>
                        <td class="value-cell">1 of 1</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- From, CC, Subject section (aligned with the left grid) -->
    <table class="meta-table" style="margin-bottom: 12px; width: 100%;">
        <tr>
            <td class="label-cell" style="width: 55px;">From</td>
            <td class="colon-cell" style="width: 12px;">:</td>
            <td class="value-cell">{{ $sales_person ?? 'Ekachai Wongdee (S01)' }}</td>
        </tr>
        <tr>
            <td class="label-cell">CC</td>
            <td class="colon-cell">:</td>
            <td class="value-cell">{{ $cc ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label-cell">Subject</td>
            <td class="colon-cell">:</td>
            <td class="value-cell-bold" style="word-wrap: break-word;">{{ $title ?? 'Boiler Maintenance Equipment Rental' }}</td>
        </tr>
    </table>

    <!-- Items Table -->
    <table class="items-table">
        <thead>
            <tr>
                <th rowspan="2" style="width: 6%;">ITEM</th>
                <th rowspan="2" style="width: 6%;">QTY</th>
                <th rowspan="2" style="width: 8%;">UNIT</th>
                <th rowspan="2" style="width: 46%;">DESCRIPTION</th>
                <th class="sub-th" style="width: 10%;">DURATION</th>
                <th class="sub-th" style="width: 11%;">UNIT RATE</th>
                <th rowspan="2" style="width: 13%;">
                    TOTAL PRICE<br>
                    <span style="font-size: 7.5px;">THB</span>
                </th>
            </tr>
            <tr>
                <th class="sub-th" style="font-size: 7.5px; border-bottom: 1px solid #000000; padding: 1px 0;">Days</th>
                <th class="sub-th" style="font-size: 7.5px; border-bottom: 1px solid #000000; padding: 1px 0;">Per Day<br><span style="font-size: 7px; font-weight: bold;">THB</span></th>
            </tr>
        </thead>
        <tbody>
            @if(isset($items) && count($items) > 0)
                @foreach($items as $index => $item)
                    <tr class="{{ $index % 2 == 0 ? 'row-even' : 'row-odd' }}">
                        <td class="text-center" style="font-weight: bold; color: #555555;">{{ $index + 1 }}</td>
                        <td class="text-center">{{ $item['qty'] ?? 1 }}</td>
                        <td class="text-center">{{ $item['unit'] ?? 'Set' }}</td>
                        <td class="text-left" style="font-weight: 500; word-wrap: break-word;">{!! nl2br(e($item['description'] ?? '')) !!}</td>
                        <td class="text-center">{{ $item['duration_days'] ?? $item['duration'] ?? 1 }}</td>
                        <td class="text-right">{{ number_format($item['unit_rate'] ?? $item['rate'] ?? 0, 2) }}</td>
                        <td class="text-right" style="font-weight: bold;">{{ number_format($item['total_price'] ?? 0, 2) }}</td>
                    </tr>
                @endforeach
            @else
                <!-- Default Placeholder item matching PDF mockup exactly -->
                <tr class="row-even">
                    <td class="text-center" style="font-weight: bold; color: #555555;">1</td>
                    <td class="text-center">1</td>
                    <td class="text-center">Set</td>
                    <td class="text-left" style="font-weight: 500;">Provision of HP Hot Boiler Wash Tooling Set</td>
                    <td class="text-center">10</td>
                    <td class="text-right">30,000.00</td>
                    <td class="text-right" style="font-weight: bold;">300,000.00</td>
                </tr>
            @endif

            <!-- Notes entry inside table columns to maximize space usage & keep alignment perfect -->
            @php
                $filledRows = isset($items) ? count($items) : 1;
                $fillerCount = max(1, 5 - $filledRows);
            @endphp
            @for($i = 0; $i < $fillerCount; $i++)
                <tr class="{{ ($filledRows + $i) % 2 == 0 ? 'row-even' : 'row-odd' }}">
                    <td class="text-center" style="{{ $i == $fillerCount - 1 ? 'border-bottom: 1px solid #000000;' : '' }}"></td>
                    <td class="text-center" style="{{ $i == $fillerCount - 1 ? 'border-bottom: 1px solid #000000;' : '' }}"></td>
                    <td class="text-center" style="{{ $i == $fillerCount - 1 ? 'border-bottom: 1px solid #000000;' : '' }}"></td>
                    <td class="text-left" style="vertical-align: top; padding: 6px; {{ $i == $fillerCount - 1 ? 'border-bottom: 1px solid #000000;' : '' }}">
                        @if($i == 0)
                            <div style="margin-top: 2px;">
                                <div style="font-weight: bold; color: #000000; font-size: 10px; margin-bottom: 2px;">Note:</div>
                                <div style="color: #444444; font-size: 9.5px; padding-left: 10px; line-height: 1.35;">
                                    {!! nl2br(e($remarks ?? "Air Compressor, Electrical, Water, Loading and Lifting Equipment at Client Side By client.")) !!}
                                </div>
                                <div style="text-align: center; font-weight: bold; font-size: 9.5px; color: #000000; letter-spacing: 2px; margin-top: 15px;">
                                    ** LAST ENTRY **
                                </div>
                            </div>
                        @endif
                    </td>
                    <td class="text-center" style="{{ $i == $fillerCount - 1 ? 'border-bottom: 1px solid #000000;' : '' }}"></td>
                    <td class="text-center" style="{{ $i == $fillerCount - 1 ? 'border-bottom: 1px solid #000000;' : '' }}"></td>
                    <td class="text-center" style="{{ $i == $fillerCount - 1 ? 'border-bottom: 1px solid #000000;' : '' }}"></td>
                </tr>
            @endfor
        </tbody>
    </table>

    <!-- Total Value Aligned Row -->
    <div class="total-value-container">
        <span class="total-value-label">Total Value</span>
        <div class="total-value-amount">
            THB {{ number_format($total_value ?? 300000.00, 2) }}
        </div>
    </div>

    <!-- Terms & Conditions Section -->
    <div class="terms-section">
        <div class="terms-title">Terms & Conditions:</div>
        @if(isset($terms_conditions) && !empty($terms_conditions))
            @foreach(explode("\n", $terms_conditions) as $line)
                @if(trim($line) !== '')
                    <div class="terms-item">
                        @if(strpos($line, '-') === 0 || strpos($line, '•') === 0)
                            {{ $line }}
                        @else
                            - {{ $line }}
                        @endif
                    </div>
                @endif
            @endforeach
        @else
            <!-- Default Terms & Conditions matching template image exactly -->
            <div class="terms-item">- 30 days validity from date of quotation.</div>
            <div class="terms-item">- All prices above are quoted in THB</div>
            <div class="terms-item">- All prices does not include 7% VAT</div>
            <div class="terms-item">- Payment term: 30 Days from date of invoice.</div>
            <div class="terms-item">- Please state our IKM reference no. on your work/purchase order.</div>
            <div class="terms-item">- IKM Testing shall not be liable for loss or damage or delay or failure in performance hereunder arising or resulting directly</div>
            <div class="terms-item" style="padding-left: 8px;">or indirectly from amongst other things such as epidemics and/or quarantine restrictions.</div>
            <div class="terms-item">- If contract or PO is cancelled after mobilization has started, then all expenses incurred shall be invoiced to Client.</div>
            <div class="terms-item">- Above price will be charged by unit rate and actual</div>
        @endif
    </div>

    <!-- Signatures -->
    <table class="signature-table">
        <tr>
            <td class="signature-col" style="text-align: left;">
                <div class="signature-title">Thanks and Regards</div>
                <div style="margin-top: 35px;">
                    @if(isset($signature_image) && !empty($signature_image))
                        <img src="{{ $signature_image }}" style="height: 35px; max-width: 180px; margin-bottom: -5px; display: block; margin-left: 10px;" alt="Signature">
                    @endif
                    <div class="signature-line"></div>
                    <div class="signature-company">IKM Testing (Thailand) Co., Ltd.</div>
                </div>
            </td>
            <td class="signature-col" style="text-align: left; padding-left: 30px;">
                <div class="signature-title-bold">CONFIRMED AND ACCEPTED BY</div>
                <div style="margin-top: 35px;">
                    <div class="signature-line" style="width: 200px;"></div>
                    <div class="signature-stamp-label">SIGNATURE & COMPANY STAMP</div>
                    <div style="font-size: 9.5px; margin-top: 4px; font-weight: bold; color: #000000;">
                        DATE :
                    </div>
                </div>
            </td>
        </tr>
    </table>

    <!-- Footer Content -->
    <table class="footer-table">
        <tr>
            <td class="footer-left">Location: BDS Folder</td>
            <td class="footer-center">Page 1 of 1</td>
            <td class="footer-right">
                TH-BDS-FRM-003 Rev 0<br>
                Effective Date: 01 Jul 2026
            </td>
        </tr>
    </table>

</body>
</html>
