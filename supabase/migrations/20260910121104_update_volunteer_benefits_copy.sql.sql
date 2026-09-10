/*
# Align volunteer benefits copy with the supplied reference

Updates the existing editable volunteer-benefits block with the five
accreditation, quality, certificate, insurance, and training messages.
*/

UPDATE cms_blocks
SET title = 'Programa desarrollado conforme a la Ley 4/1998 de Voluntariado de Canarias.',
    body = '[{"icon":"building","title":"Acreditado por el Gobierno de Canarias","detail":"Decreto 13/2020"},{"icon":"award","title":"Integrado en Sistema de Calidad","detail":"ISO 9001:2015"},{"icon":"badge","title":"Certificado oficial","detail":"de participación"},{"icon":"shield","title":"Seguro de voluntariado","detail":"incluido"},{"icon":"graduation","title":"Formación certificada","detail":"y seguimiento profesional"}]',
    is_visible = true
WHERE page_id = 'b6d0447b-c80c-48d6-947d-c2bc4de0602d'
  AND block_type = 'volunteer-benefits';