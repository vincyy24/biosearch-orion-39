from rest_framework import serializers
from .models import DataCategory, DataType, FileUpload


class DataTypeSerializer(serializers.ModelSerializer):
    """
    Serializer for DataType model with a CharField primary key.
    """
    id = serializers.CharField(max_length=50)

    class Meta:
        model = DataType
        fields = [
            'id',
            'name']


class DataCategorySerializer(serializers.ModelSerializer):
    """
    Serializer for DataCategory model, handling choice fields appropriately.
    """
    name = serializers.ChoiceField(choices=DataCategory.CATEGORY_CHOICES)

    class Meta:
        model = DataCategory
        fields = [
            'id',
            'name',
            'description',
        ]


class FileUploadSerializer(serializers.ModelSerializer):
    """
    Serializer for file upload.
    """
    class Meta:
        model = FileUpload
        fields = [
            'file_name',
            'content',
            'description',
            'uploaded_by',
            'upload_date',
            'experiment_type',
            'data_type',
            'is_public',
            'version',
            'category',
            'research_id',
            'method',
            'electrode_type',
            'instrument',
            'delimiter',
        ]
