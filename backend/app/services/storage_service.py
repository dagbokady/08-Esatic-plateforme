
from supabase import create_client
from dotenv import load_dotenv
import os
import uuid

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME  = "fichiers"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def upload_fichier(contenu: bytes, nom_original: str, content_type: str) -> str:
    """
    Upload un fichier sur Supabase Storage.
    Retourne l'URL publique du fichier.
    """
    # Générer un nom unique pour éviter les collisions
    extension  = nom_original.rsplit('.', 1)[-1] if '.' in nom_original else 'bin'
    nom_unique = f"{uuid.uuid4()}.{extension}"

    # Upload vers Supabase
    supabase.storage.from_(BUCKET_NAME).upload(
        path         = nom_unique,
        file         = contenu,
        file_options = {"content-type": content_type}
    )

    # Construire et retourner l'URL publique
    url = supabase.storage.from_(BUCKET_NAME).get_public_url(nom_unique)
    return url


def supprimer_fichier_storage(url: str) -> None:
    """
    Supprime un fichier de Supabase Storage à partir de son URL.
    """
    try:
        # Extraire le nom du fichier depuis l'URL
        nom_fichier = url.split(f"{BUCKET_NAME}/")[-1]
        supabase.storage.from_(BUCKET_NAME).remove([nom_fichier])
    except Exception as e:
        print(f"⚠️ Erreur suppression storage : {e}")