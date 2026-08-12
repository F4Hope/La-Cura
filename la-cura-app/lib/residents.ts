import {
  getResidentPhotoSignedUrl,
} from "@/lib/residentPhotos";

import {
  createClient,
} from "@/lib/supabase/server";


export async function getResidents() {
  const supabase =
    await createClient();


  const {
    data,
    error,
  } = await supabase
    .from("residents")
    .select("*")
    .order(
      "full_name",
      {
        ascending: true,
      }
    );


  if (error) {
    console.error(
      "Unable to load residents:",
      error.message
    );

    return [];
  }


  const residents =
    data ?? [];


  return Promise.all(
    residents.map(
      async (
        resident
      ) => {
        const photoUrl =
          await getResidentPhotoSignedUrl(
            supabase,
            resident.photo_url
          );

        return {
          ...resident,

          photo_url:
            photoUrl,
        };
      }
    )
  );
}
