from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Project, Canvas, Schema
from .serializers import ProjectSerializer, CanvasSerializer, SchemaSerializer
import json


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer

    def get_queryset(self):
        """Allow filtering by client_id via ?client_id=..."""
        qs = Project.objects.all().order_by('-created_at')
        client_id = self.request.query_params.get('client_id')
        if client_id is not None:
            qs = qs.filter(client_id=client_id)
        return qs

    def _extract_client_id_from_data(self, raw_data):
        """
        Accepts either a dict or a JSON string and returns the nested user.id if present.
        Returns None when not found.
        """
        data = raw_data
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except Exception:
                return None

        if not isinstance(data, dict):
            return None

        user = data.get("user") or {}
        if isinstance(user, dict):
            client_id = user.get("id")
            # Normalize numeric-looking ids to int, otherwise keep as string
            if client_id is None:
                return None
            try:
                # if it's numeric and not a long id representation you want as string:
                return int(client_id)
            except (ValueError, TypeError):
                return str(client_id)
        return None

    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        raw_data = data.get("data")
        client_id = self._extract_client_id_from_data(raw_data)

        if client_id is not None:
            # put client_id into top-level field so serializer writes it to model.client_id
            data["client_id"] = client_id

        # Ensure data is a dict (if data was sent as a JSON string)
        raw_data = data.get("data")
        if isinstance(raw_data, str):
            try:
                data["data"] = json.loads(raw_data)
            except Exception:
                # leave as-is; serializer will validate and raise if invalid
                pass

        # Use the prepared data (including client_id) when validating/creating
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
class CanvasViewSet(viewsets.ModelViewSet):
    queryset = Canvas.objects.all().order_by('-updated_at')
    serializer_class = CanvasSerializer

    def get_queryset(self):
        """Allow filtering by project via ?project=..."""
        qs = Canvas.objects.all().order_by('-updated_at')
        project = self.request.query_params.get('project')
        if project is not None:
            qs = qs.filter(project=project)
        return qs

class SchemaViewSet(viewsets.ModelViewSet):
    queryset = Schema.objects.all().order_by('-uploaded_at')
    serializer_class = SchemaSerializer

    def get_queryset(self):
        """Allow filtering by project via ?project=..."""
        qs = Schema.objects.all().order_by('-uploaded_at')
        project = self.request.query_params.get('project')
        if project is not None:
            qs = qs.filter(project=project)
        return qs
