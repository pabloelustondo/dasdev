﻿CREATE PROCEDURE [MCDA].[DeviceStatInt_GetAll]
(	
	@BatchSize int = 0
)
AS
BEGIN
	SET NOCOUNT ON;
	Declare @status int = -1;
	Declare @lastTime datetime;
	Declare @PreviousTime datetime;

	Declare @lastTimeTmp datetime;
	Declare @tablename nvarchar(256);

	select @tablename = 'DeviceStatInt'

	IF (@BatchSize = 0 )
		SET @BatchSize = 400;

	IF EXISTS(SELECT 1 from [MCDA].[DeviceSyncStatus] where Name = @tablename)
	BEGIN
		
		Select	@status=[Status], 
				@lastTime=LastSyncTime, 
				@PreviousTime=PreviousSyncTime 
				from [MCDA].[DeviceSyncStatus] where Name = @tablename

		If (@status = 1)		--Improgress
			return;
		ELSE IF (@status = 0)	--Success
			BEGIN
				Select @lastTimeTmp = max(a.ts) 
				from (
					select top (@BatchSize) [timestamp] as ts from [$(MobiControlDB)].dbo.DeviceStatInt WITH (NOLOCK) 
					where [timestamp] > @lastTime
					order by [timestamp] asc
					 ) a

				IF( @lastTimeTmp IS NOT NULL)
				BEGIN 
					EXEC [MCDA].[DeviceSyncStatus_Update] @Name=@tablename, @Status=0, @LastSyncTime=@lastTimeTmp, @PreviousSyncTime=@lastTime
				END

				SELECT d.DevId as DeviceId, A.[TimeStamp], A.[StatType], A.[IntValue], A.[ServerDateTime]
					FROM [$(MobiControlDB)].dbo.DeviceStatInt AS A WITH (NOLOCK) 
					INNER JOIN [$(MobiControlDB)].dbo.devInfo as D WITH (NOLOCK) ON A.DeviceId = D.DeviceId
					WHERE [timestamp] > @lastTime and [timestamp] <= @lastTimeTmp
			END
		ELSE					--failed
			BEGIN
				IF( @PreviousTime IS NOT NULL)
				BEGIN
					EXEC [MCDA].[DeviceSyncStatus_Update] @Name=@tablename, @Status=1

					SELECT d.DevId as DeviceId, A.[TimeStamp], A.[StatType], A.[IntValue], A.[ServerDateTime]
					FROM [$(MobiControlDB)].dbo.DeviceStatInt AS A WITH (NOLOCK) 
					INNER JOIN [$(MobiControlDB)].dbo.devInfo as D WITH (NOLOCK) ON A.DeviceId = D.DeviceId
					WHERE [timestamp] > @PreviousTime and [timestamp] <= @lastTime
				END
				ELSE
				BEGIN
					EXEC [MCDA].[DeviceSyncStatus_Update] @Name=@tablename, @Status=1

					SELECT d.DevId as DeviceId, A.[TimeStamp], A.[StatType], A.[IntValue], A.[ServerDateTime]
					FROM [$(MobiControlDB)].dbo.DeviceStatInt AS A WITH (NOLOCK) 
					INNER JOIN [$(MobiControlDB)].dbo.devInfo as D WITH (NOLOCK) ON A.DeviceId = D.DeviceId
					WHERE A.[timestamp] <= @lastTime
				END
				
			END
	END
	ELSE 
	BEGIN
		Select @lastTime = max(a.ts) from (
			select top (@BatchSize) [timestamp] as ts from [$(MobiControlDB)].dbo.DeviceStatInt WITH (NOLOCK) order by [timestamp] asc
			) a

		IF (@lastTime IS NOT NULL AND NOT EXISTS(SELECT 1 from [MCDA].[DeviceSyncStatus] where Name = @tablename))
		BEGIN
			EXEC [MCDA].[DeviceSyncStatus_Insert] @Name = @tablename, @status = 1, @LastSyncTime = @lastTime

			SELECT d.DevId as DeviceId, A.[TimeStamp], A.[StatType], A.[IntValue], A.[ServerDateTime]
				FROM [$(MobiControlDB)].dbo.DeviceStatInt AS A WITH (NOLOCK) 
				INNER JOIN [$(MobiControlDB)].dbo.devInfo as D WITH (NOLOCK) ON A.DeviceId = D.DeviceId
				WHERE A.[timestamp] <= @lastTime
		END
	END
END