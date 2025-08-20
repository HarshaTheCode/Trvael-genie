import { ItineraryResponse } from '@shared/api';

export class PDFExportService {
  /**
   * Generate professional PDF content for an itinerary
   * For now, returns well-formatted text. In production, use puppeteer or jsPDF
   */
  static generateProfessionalPDF(itinerary: ItineraryResponse): string {
    const lines: string[] = [];

    // Header
    lines.push('═'.repeat(80));
    lines.push(`                    ${itinerary.title.toUpperCase()}`);
    lines.push('═'.repeat(80));
    lines.push('');

    // Trip Overview
    lines.push('📍 TRIP OVERVIEW');
    lines.push('─'.repeat(50));
    lines.push(`Destination:     ${itinerary.meta.destination}`);
    lines.push(`Travel Dates:    ${itinerary.meta.start_date} to ${itinerary.meta.end_date}`);
    lines.push(`Travelers:       ${itinerary.meta.travelers}`);
    lines.push(`Budget Tier:     ${itinerary.meta.budget.toUpperCase()}`);
    lines.push(`Travel Style:    ${itinerary.meta.style.toUpperCase()}`);
    lines.push('');

    // Budget Estimate
    lines.push('💰 BUDGET ESTIMATE (Per Person)');
    lines.push('─'.repeat(50));
    lines.push(`Budget Range:    ₹${itinerary.budget_estimate.low.toLocaleString()} - ₹${itinerary.budget_estimate.high.toLocaleString()}`);
    lines.push(`Recommended:     ₹${itinerary.budget_estimate.median.toLocaleString()}`);
    lines.push('');

    // Daily Itinerary
    lines.push('📅 DETAILED ITINERARY');
    lines.push('═'.repeat(80));

    itinerary.days.forEach((day, index) => {
      // Day header
      lines.push('');
      lines.push(`DAY ${day.day} - ${new Date(day.date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`);
      lines.push('─'.repeat(60));

      // Day segments
      day.segments.forEach((segment, segIndex) => {
        lines.push(`${segment.time}    ${segment.place}`);
        lines.push(`          Duration: ${segment.duration_min} minutes`);
        lines.push(`          ${segment.note}`);
        
        if (segment.food) {
          lines.push(`          🍽️  ${segment.food}`);
        }
        
        if (segment.transport_min_to_next > 0 && segIndex < day.segments.length - 1) {
          lines.push(`          🚗 Travel time to next: ${segment.transport_min_to_next} minutes`);
        }
        
        lines.push('');
      });

      // Daily tip
      if (day.daily_tip) {
        lines.push(`💡 Daily Tip: ${day.daily_tip}`);
        lines.push('');
      }
    });

    // Useful Information
    if (itinerary.source_facts && itinerary.source_facts.length > 0) {
      lines.push('ℹ️  USEFUL INFORMATION');
      lines.push('─'.repeat(50));
      itinerary.source_facts.forEach(fact => {
        lines.push(`• ${fact}`);
      });
      lines.push('');
    }

    // Footer
    lines.push('─'.repeat(80));
    lines.push(`Generated on: ${new Date(itinerary.generated_at).toLocaleString()}`);
    lines.push('Powered by TravelGenie - AI Travel Planning for India');
    lines.push('Visit: https://travelgenie.com');
    lines.push('═'.repeat(80));

    return lines.join('\n');
  }

  /**
   * Generate HTML version for better PDF rendering
   */
  static generateHTML(itinerary: ItineraryResponse): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${itinerary.title}</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                color: #333;
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #ea580c;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #ea580c;
                font-size: 2.5em;
                margin: 0;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            .overview {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
            }
            .overview h2 {
                color: #ea580c;
                margin-top: 0;
                font-size: 1.3em;
            }
            .overview-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            .overview-item {
                display: flex;
            }
            .overview-label {
                font-weight: bold;
                min-width: 120px;
            }
            .budget {
                background: #e7f3ff;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
            }
            .budget h2 {
                color: #0066cc;
                margin-top: 0;
            }
            .budget-item {
                display: flex;
                justify-content: space-between;
                margin: 10px 0;
            }
            .budget-recommended {
                font-weight: bold;
                font-size: 1.1em;
                color: #0066cc;
            }
            .day {
                margin-bottom: 40px;
                page-break-inside: avoid;
            }
            .day-header {
                background: #ea580c;
                color: white;
                padding: 15px;
                border-radius: 8px 8px 0 0;
                font-size: 1.2em;
                font-weight: bold;
            }
            .day-content {
                border: 2px solid #ea580c;
                border-top: none;
                border-radius: 0 0 8px 8px;
                padding: 20px;
            }
            .segment {
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 1px solid #eee;
            }
            .segment:last-child {
                border-bottom: none;
            }
            .segment-header {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
            }
            .segment-time {
                background: #ea580c;
                color: white;
                padding: 5px 12px;
                border-radius: 15px;
                font-weight: bold;
                margin-right: 15px;
                min-width: 60px;
                text-align: center;
            }
            .segment-place {
                font-size: 1.1em;
                font-weight: bold;
                color: #333;
            }
            .segment-duration {
                color: #666;
                font-size: 0.9em;
                margin-left: auto;
            }
            .segment-note {
                margin: 10px 0;
                color: #555;
            }
            .segment-food {
                background: #f0f8ff;
                padding: 8px 12px;
                border-radius: 5px;
                margin: 10px 0;
                border-left: 4px solid #4CAF50;
            }
            .segment-transport {
                color: #666;
                font-style: italic;
                font-size: 0.9em;
                margin-top: 10px;
            }
            .daily-tip {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                padding: 15px;
                border-radius: 5px;
                margin-top: 20px;
            }
            .daily-tip-label {
                font-weight: bold;
                color: #856404;
                margin-bottom: 5px;
            }
            .useful-info {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-top: 30px;
            }
            .useful-info h2 {
                color: #333;
                margin-top: 0;
            }
            .useful-info ul {
                margin: 0;
                padding-left: 20px;
            }
            .useful-info li {
                margin-bottom: 8px;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 2px solid #eee;
                color: #666;
                font-size: 0.9em;
            }
            @media print {
                body { font-size: 12px; }
                .day { page-break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>${itinerary.title}</h1>
        </div>

        <div class="overview">
            <h2>📍 Trip Overview</h2>
            <div class="overview-grid">
                <div class="overview-item">
                    <span class="overview-label">Destination:</span>
                    <span>${itinerary.meta.destination}</span>
                </div>
                <div class="overview-item">
                    <span class="overview-label">Travel Dates:</span>
                    <span>${itinerary.meta.start_date} to ${itinerary.meta.end_date}</span>
                </div>
                <div class="overview-item">
                    <span class="overview-label">Travelers:</span>
                    <span>${itinerary.meta.travelers}</span>
                </div>
                <div class="overview-item">
                    <span class="overview-label">Budget Tier:</span>
                    <span>${itinerary.meta.budget.toUpperCase()}</span>
                </div>
                <div class="overview-item">
                    <span class="overview-label">Travel Style:</span>
                    <span>${itinerary.meta.style.toUpperCase()}</span>
                </div>
            </div>
        </div>

        <div class="budget">
            <h2>💰 Budget Estimate (Per Person)</h2>
            <div class="budget-item">
                <span>Budget Range:</span>
                <span>₹${itinerary.budget_estimate.low.toLocaleString()} - ₹${itinerary.budget_estimate.high.toLocaleString()}</span>
            </div>
            <div class="budget-item budget-recommended">
                <span>Recommended:</span>
                <span>₹${itinerary.budget_estimate.median.toLocaleString()}</span>
            </div>
        </div>

        ${itinerary.days.map((day, index) => `
            <div class="day">
                <div class="day-header">
                    Day ${day.day} - ${new Date(day.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </div>
                <div class="day-content">
                    ${day.segments.map((segment, segIndex) => `
                        <div class="segment">
                            <div class="segment-header">
                                <span class="segment-time">${segment.time}</span>
                                <span class="segment-place">${segment.place}</span>
                                <span class="segment-duration">${segment.duration_min} min</span>
                            </div>
                            <div class="segment-note">${segment.note}</div>
                            ${segment.food ? `<div class="segment-food">🍽️ ${segment.food}</div>` : ''}
                            ${segment.transport_min_to_next > 0 && segIndex < day.segments.length - 1 ? 
                                `<div class="segment-transport">🚗 Travel time to next: ${segment.transport_min_to_next} minutes</div>` : ''}
                        </div>
                    `).join('')}
                    ${day.daily_tip ? `
                        <div class="daily-tip">
                            <div class="daily-tip-label">💡 Daily Tip:</div>
                            <div>${day.daily_tip}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('')}

        ${itinerary.source_facts && itinerary.source_facts.length > 0 ? `
            <div class="useful-info">
                <h2>ℹ️ Useful Information</h2>
                <ul>
                    ${itinerary.source_facts.map(fact => `<li>${fact}</li>`).join('')}
                </ul>
            </div>
        ` : ''}

        <div class="footer">
            <p>Generated on: ${new Date(itinerary.generated_at).toLocaleString()}</p>
            <p><strong>TravelGenie</strong> - AI Travel Planning for India</p>
            <p>Visit: https://travelgenie.com</p>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Get appropriate filename for the PDF
   */
  static getFilename(itinerary: ItineraryResponse): string {
    const destination = itinerary.meta.destination.replace(/[^a-zA-Z0-9]/g, '-');
    const startDate = itinerary.meta.start_date;
    return `TravelGenie-${destination}-${startDate}.pdf`;
  }
}
