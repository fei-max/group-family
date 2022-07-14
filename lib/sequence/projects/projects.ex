defmodule Sequence.Projects do
  @moduledoc """
  The Projects context.
  """

  import Ecto.Query, warn: false
  alias Sequence.Repo

  alias Sequence.{Users.User}
  alias Sequence.Projects.{Project, UserProject}

  @spec list_user_projects(User.t()) :: [Project.t()]
  def list_user_projects(user, include_archived \\ false) do
    project_ids = list_user_project_ids(user)
    query = from p in Project, where: p.id in ^project_ids and is_nil(p.deleted_at), order_by: [asc: :id]

    if !include_archived do
      query |> where([up], is_nil(up.archived_at))
    else
      query
    end |> Repo.all
  end

  @spec list_user_projects(User.t()) :: [UserProject.t()]
  def list_user_project_ids(user) do
    Repo.all(from up in UserProject, select: up.project_id, where: up.user_id == ^user.id and is_nil(up.left_at))
  end

  @spec get_user_project(User.t() | binary, Team.t() | binary, boolean) :: UserTeam.t() | nil
  def get_user_project(user, project, active_only \\ true) do
    user_id = if is_map(user), do: user.id, else: user
    project_id = if is_map(project), do: project.id, else: project

    query = from up in UserProject, where: up.user_id == ^user_id and
      up.project_id == ^project_id, limit: 1

    if active_only do
      query |> where([up], is_nil(up.left_at))
    else
      query
    end |> Repo.one
  end

  def is_member?(project, user) do
    get_user_project(user, project) != nil
  end

  @spec project_by_uuid!(binary, binary) :: Project.t()
  def project_by_uuid!(user_id, uuid) do
    {:ok, project} = project_by_uuid(user_id, uuid)
    project
  end

  @spec project_by_uuid(binary, binary) :: {:error, :not_found} | {:ok, Project.t()}
  def project_by_uuid(nil, _uuid), do: {:error, :not_found}
  def project_by_uuid(_user_id, nil), do: {:error, :not_found}

  def project_by_uuid(user_id, uuid) do
    with {:ok, project} <- project_by_uuid(uuid) do
      if is_member?(project, user_id), do: {:ok, project}, else: {:error, :not_found}
    end
  end

  @spec project_by_uuid(binary) :: {:error, :not_found} | {:ok, Project.t()}
  def project_by_uuid(uuid) do
    if uuid != nil and uuid != "undefined" and uuid != "" do
      project = Repo.one(from q in Project, where: q.uuid == ^uuid)
      if project, do: {:ok, project}, else: {:error, :not_found}
    else
      {:error, :not_found}
    end
  end

  @spec join_project(User.t(), Project.t(), binary) :: {:ok, UserProject.t()}
  def join_project(user, project, role) do
    case get_user_project(user, project, false) do
      nil ->
        create_user_project(%{ user_id: user.id, project_id: project.id,
          role: role })
      up ->
        update_user_project(up, %{ left_at: nil })
    end
  end

  @doc """
  Returns the list of projects.

  ## Examples

      iex> list_projects()
      [%Project{}, ...]

  """
  def list_projects do
    Repo.all(Project)
  end

  @doc """
  Gets a single project.

  Raises `Ecto.NoResultsError` if the Project does not exist.

  ## Examples

      iex> get_project!(123)
      %Project{}

      iex> get_project!(456)
      ** (Ecto.NoResultsError)

  """
  def get_project!(id), do: Repo.get!(Project, id)

  @doc """
  Creates a project.

  ## Examples

      iex> create_project(%{field: value})
      {:ok, %Project{}}

      iex> create_project(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_project(attrs \\ %{}) do
    %Project{}
    |> Project.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a project.

  ## Examples

      iex> update_project(project, %{field: new_value})
      {:ok, %Project{}}

      iex> update_project(project, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_project(%Project{} = project, attrs) do
    project
    |> Project.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a project.

  ## Examples

      iex> delete_project(project)
      {:ok, %Project{}}

      iex> delete_project(project)
      {:error, %Ecto.Changeset{}}

  """
  def delete_project(%Project{} = project) do
    Repo.delete(project)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking project changes.

  ## Examples

      iex> change_project(project)
      %Ecto.Changeset{data: %Project{}}

  """
  def change_project(%Project{} = project, attrs \\ %{}) do
    Project.changeset(project, attrs)
  end

  @doc """
  Returns the list of user_projects.

  ## Examples

      iex> list_user_projects()
      [%UserProject{}, ...]

  """
  def list_user_projects do
    Repo.all(UserProject)
  end

  @doc """
  Gets a single user_project.

  Raises `Ecto.NoResultsError` if the User project does not exist.

  ## Examples

      iex> get_user_project!(123)
      %UserProject{}

      iex> get_user_project!(456)
      ** (Ecto.NoResultsError)

  """
  def get_user_project!(id), do: Repo.get!(UserProject, id)

  @doc """
  Creates a user_project.

  ## Examples

      iex> create_user_project(%{field: value})
      {:ok, %UserProject{}}

      iex> create_user_project(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_user_project(attrs \\ %{}) do
    %UserProject{}
    |> UserProject.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a user_project.

  ## Examples

      iex> update_user_project(user_project, %{field: new_value})
      {:ok, %UserProject{}}

      iex> update_user_project(user_project, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_user_project(%UserProject{} = user_project, attrs) do
    user_project
    |> UserProject.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a user_project.

  ## Examples

      iex> delete_user_project(user_project)
      {:ok, %UserProject{}}

      iex> delete_user_project(user_project)
      {:error, %Ecto.Changeset{}}

  """
  def delete_user_project(%UserProject{} = user_project) do
    Repo.delete(user_project)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking user_project changes.

  ## Examples

      iex> change_user_project(user_project)
      %Ecto.Changeset{data: %UserProject{}}

  """
  def change_user_project(%UserProject{} = user_project, attrs \\ %{}) do
    UserProject.changeset(user_project, attrs)
  end
end
