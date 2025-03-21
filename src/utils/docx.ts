import { Document, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import type { ChangeRequest } from '../types';

export async function generateChangeRequestDoc(request: ChangeRequest) {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: 'Change Request Document',
          heading: 'Title',
          spacing: { after: 200 }
        }),
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Title')] }),
                new TableCell({ children: [new Paragraph(request.title)] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Description')] }),
                new TableCell({ children: [new Paragraph(request.description)] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Change Type')] }),
                new TableCell({ children: [new Paragraph(request.changeType)] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Impact Level')] }),
                new TableCell({ children: [new Paragraph(request.impactLevel)] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Expected Downtime')] }),
                new TableCell({ children: [new Paragraph(request.expectedDowntime)] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Rollback Plan')] }),
                new TableCell({ children: [new Paragraph(request.rollbackPlan || 'N/A')] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Status')] }),
                new TableCell({ children: [new Paragraph(request.status)] })
              ]
            })
          ]
        })
      ]
    }]
  });

  const blob = await doc.save('blob');
  saveAs(blob, `change-request-${request.id}.docx`);
}