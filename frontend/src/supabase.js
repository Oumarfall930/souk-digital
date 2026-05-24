import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qprnhlxyfrsvymjrvdjc.supabase.co',
  'sb_publishable_l2JA-Iq3zw4TnpW0TcBVAQ_pwoupEYv'
);

export async function uploadImage(file, folder = 'products') {
  const extension = file.name.split('.').pop();
  const filename  = `${folder}/${Date.now()}.${extension}`;

  const { data, error } = await supabase.storage
    .from('souk-image')
    .upload(filename, file, { upsert: false });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('souk-image')
    .getPublicUrl(filename);

  return urlData.publicUrl;
}
