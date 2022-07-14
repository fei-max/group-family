defmodule Sequence.ProjectsTest do
  use Sequence.DataCase

  alias Sequence.Projects

  describe "projects" do
    alias Sequence.Projects.Project

    import Sequence.ProjectsFixtures

    @invalid_attrs %{archived_at: nil, meta: nil, name: nil}

    test "list_projects/0 returns all projects" do
      project = project_fixture()
      assert Projects.list_projects() == [project]
    end

    test "get_project!/1 returns the project with given id" do
      project = project_fixture()
      assert Projects.get_project!(project.id) == project
    end

    test "create_project/1 with valid data creates a project" do
      valid_attrs = %{archived_at: ~U[2022-07-13 06:12:00Z], meta: %{}, name: "some name"}

      assert {:ok, %Project{} = project} = Projects.create_project(valid_attrs)
      assert project.archived_at == ~U[2022-07-13 06:12:00Z]
      assert project.meta == %{}
      assert project.name == "some name"
    end

    test "create_project/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Projects.create_project(@invalid_attrs)
    end

    test "update_project/2 with valid data updates the project" do
      project = project_fixture()
      update_attrs = %{archived_at: ~U[2022-07-14 06:12:00Z], meta: %{}, name: "some updated name"}

      assert {:ok, %Project{} = project} = Projects.update_project(project, update_attrs)
      assert project.archived_at == ~U[2022-07-14 06:12:00Z]
      assert project.meta == %{}
      assert project.name == "some updated name"
    end

    test "update_project/2 with invalid data returns error changeset" do
      project = project_fixture()
      assert {:error, %Ecto.Changeset{}} = Projects.update_project(project, @invalid_attrs)
      assert project == Projects.get_project!(project.id)
    end

    test "delete_project/1 deletes the project" do
      project = project_fixture()
      assert {:ok, %Project{}} = Projects.delete_project(project)
      assert_raise Ecto.NoResultsError, fn -> Projects.get_project!(project.id) end
    end

    test "change_project/1 returns a project changeset" do
      project = project_fixture()
      assert %Ecto.Changeset{} = Projects.change_project(project)
    end
  end

  describe "user_projects" do
    alias Sequence.Projects.UserProject

    import Sequence.ProjectsFixtures

    @invalid_attrs %{left_at: nil, role: nil}

    test "list_user_projects/0 returns all user_projects" do
      user_project = user_project_fixture()
      assert Projects.list_user_projects() == [user_project]
    end

    test "get_user_project!/1 returns the user_project with given id" do
      user_project = user_project_fixture()
      assert Projects.get_user_project!(user_project.id) == user_project
    end

    test "create_user_project/1 with valid data creates a user_project" do
      valid_attrs = %{left_at: ~U[2022-07-13 06:14:00Z], role: "some role"}

      assert {:ok, %UserProject{} = user_project} = Projects.create_user_project(valid_attrs)
      assert user_project.left_at == ~U[2022-07-13 06:14:00Z]
      assert user_project.role == "some role"
    end

    test "create_user_project/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Projects.create_user_project(@invalid_attrs)
    end

    test "update_user_project/2 with valid data updates the user_project" do
      user_project = user_project_fixture()
      update_attrs = %{left_at: ~U[2022-07-14 06:14:00Z], role: "some updated role"}

      assert {:ok, %UserProject{} = user_project} = Projects.update_user_project(user_project, update_attrs)
      assert user_project.left_at == ~U[2022-07-14 06:14:00Z]
      assert user_project.role == "some updated role"
    end

    test "update_user_project/2 with invalid data returns error changeset" do
      user_project = user_project_fixture()
      assert {:error, %Ecto.Changeset{}} = Projects.update_user_project(user_project, @invalid_attrs)
      assert user_project == Projects.get_user_project!(user_project.id)
    end

    test "delete_user_project/1 deletes the user_project" do
      user_project = user_project_fixture()
      assert {:ok, %UserProject{}} = Projects.delete_user_project(user_project)
      assert_raise Ecto.NoResultsError, fn -> Projects.get_user_project!(user_project.id) end
    end

    test "change_user_project/1 returns a user_project changeset" do
      user_project = user_project_fixture()
      assert %Ecto.Changeset{} = Projects.change_user_project(user_project)
    end
  end
end
